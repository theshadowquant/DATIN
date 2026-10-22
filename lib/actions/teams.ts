"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerSoloEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in to register." };
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, usn")
    .eq("id", user.id)
    .single();

  // Fetch event
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    return { success: false, error: "Event not found." };
  }

  if (!event.is_published || !event.is_registration_open) {
    return { success: false, error: "Registration for this event is currently closed." };
  }

  if (event.registered_count >= event.capacity) {
    return { success: false, error: "This event has reached full capacity." };
  }

  // Check if already in this event
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return { success: false, error: "You are already registered for this event." };
  }

  // Create solo team
  let code = generateInviteCode();
  const teamName = `${profile?.full_name || "Participant"} (Solo)`;

  const { data: newTeam, error: teamErr } = await supabase
    .from("teams")
    .insert({
      event_id: eventId,
      name: teamName,
      invite_code: code,
      leader_id: user.id,
      is_finalized: true,
    })
    .select()
    .single();

  if (teamErr || !newTeam) {
    return { success: false, error: teamErr?.message || "Failed to create registration." };
  }

  // Add member record
  const { error: memberErr } = await supabase
    .from("team_members")
    .insert({
      team_id: newTeam.id,
      event_id: eventId,
      user_id: user.id,
    });

  if (memberErr) {
    return { success: false, error: memberErr.message };
  }

  // Increment registered_count
  await supabase
    .from("events")
    .update({ registered_count: (event.registered_count || 0) + 1 })
    .eq("id", eventId);

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile?.full_name || user.email,
    actor_role: "participant",
    action: "EVENT_SOLO_REGISTERED",
    entity_type: "event",
    entity_id: eventId,
    details: `Participant registered for solo event: ${event.title}`,
  });

  revalidatePath("/app/events");
  revalidatePath("/app/teams");
  revalidatePath("/app/dashboard");
  return { success: true, teamId: newTeam.id };
}

export async function createTeam(eventId: string, teamName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in to create a team." };
  }

  const cleanName = teamName.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Team name must be at least 2 characters long." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    return { success: false, error: "Event not found." };
  }

  if (!event.is_published || !event.is_registration_open) {
    return { success: false, error: "Registration for this event is closed." };
  }

  // Check if user is already in this event
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return { success: false, error: "You are already registered in a team for this event." };
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode();

  const { data: newTeam, error: teamErr } = await supabase
    .from("teams")
    .insert({
      event_id: eventId,
      name: cleanName,
      invite_code: inviteCode,
      leader_id: user.id,
      is_finalized: false,
    })
    .select()
    .single();

  if (teamErr) {
    if (teamErr.code === "23505") {
      return { success: false, error: "A team with this name already exists for this event." };
    }
    return { success: false, error: teamErr.message };
  }

  // Add leader as team member
  const { error: memberErr } = await supabase
    .from("team_members")
    .insert({
      team_id: newTeam.id,
      event_id: eventId,
      user_id: user.id,
    });

  if (memberErr) {
    return { success: false, error: memberErr.message };
  }

  // Increment event registered count
  await supabase
    .from("events")
    .update({ registered_count: (event.registered_count || 0) + 1 })
    .eq("id", eventId);

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile?.full_name || user.email,
    actor_role: "participant",
    action: "TEAM_CREATED",
    entity_type: "team",
    entity_id: newTeam.id,
    details: `Created team '${cleanName}' (Code: ${inviteCode}) for event: ${event.title}`,
  });

  revalidatePath("/app/events");
  revalidatePath("/app/teams");
  revalidatePath("/app/dashboard");
  return { success: true, teamId: newTeam.id, inviteCode };
}

export async function joinTeamByCode(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in to join a team." };
  }

  const cleanCode = inviteCode.trim().toUpperCase();
  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: "Please enter a valid 6-character team invite code." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Find team with code
  const { data: team, error: teamErr } = await supabase
    .from("teams")
    .select("*, events(*)")
    .eq("invite_code", cleanCode)
    .single();

  if (teamErr || !team) {
    return { success: false, error: "Invalid team code. No matching team found." };
  }

  const event = team.events;
  if (!event || !event.is_published || !event.is_registration_open) {
    return { success: false, error: "Registration for this event is closed." };
  }

  // Check if user is already on a team for this event
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return { success: false, error: "You are already a member of a team for this event." };
  }

  // Check current member count
  const { count } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", team.id);

  const currentCount = count || 0;
  if (currentCount >= event.max_team_size) {
    return {
      success: false,
      error: `This team has reached the maximum size limit of ${event.max_team_size} members.`,
    };
  }

  // Join team
  const { error: memberErr } = await supabase
    .from("team_members")
    .insert({
      team_id: team.id,
      event_id: event.id,
      user_id: user.id,
    });

  if (memberErr) {
    return { success: false, error: memberErr.message };
  }

  // Increment event registered count
  await supabase
    .from("events")
    .update({ registered_count: (event.registered_count || 0) + 1 })
    .eq("id", event.id);

  // If team reaches max size, auto-finalize
  if (currentCount + 1 >= event.max_team_size) {
    await supabase.from("teams").update({ is_finalized: true }).eq("id", team.id);
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile?.full_name || user.email,
    actor_role: "participant",
    action: "TEAM_JOINED",
    entity_type: "team",
    entity_id: team.id,
    details: `Joined team '${team.name}' (Code: ${cleanCode}) for event: ${event.title}`,
  });

  revalidatePath("/app/events");
  revalidatePath("/app/teams");
  revalidatePath("/app/dashboard");
  return { success: true, teamName: team.name };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized." };
  }

  const { data: team } = await supabase
    .from("teams")
    .select("*, events(*)")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false, error: "Team not found." };
  }

  // Remove membership
  const { error: delErr } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  // Decrement event registered count
  if (team.events) {
    await supabase
      .from("events")
      .update({ registered_count: Math.max(0, (team.events.registered_count || 1) - 1) })
      .eq("id", team.event_id);
  }

  // Check remaining members
  const { data: remainingMembers } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId);

  if (!remainingMembers || remainingMembers.length === 0) {
    // Delete empty team
    await supabase.from("teams").delete().eq("id", teamId);
  } else if (team.leader_id === user.id) {
    // Assign leader to first remaining member
    await supabase
      .from("teams")
      .update({ leader_id: remainingMembers[0].user_id })
      .eq("id", teamId);
  }

  revalidatePath("/app/events");
  revalidatePath("/app/teams");
  revalidatePath("/app/dashboard");
  return { success: true };
}
