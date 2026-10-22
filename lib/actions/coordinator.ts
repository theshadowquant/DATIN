"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. CREATE EVENT
export async function createEvent(formData: {
  title: string;
  slug?: string;
  category: string;
  description: string;
  teamFormat: "solo" | "duo" | "squad_4" | "flexible";
  minTeamSize: number;
  maxTeamSize: number;
  venue: string;
  date: string;
  time: string;
  capacity: number;
  isPublished: boolean;
  isRegistrationOpen: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator") {
    return { success: false, error: "Forbidden: Coordinator credentials required." };
  }

  // Generate slug if omitted
  let slug = formData.slug?.trim() || "";
  if (!slug) {
    slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  let minSize = 1;
  let maxSize = 1;

  if (formData.teamFormat === "solo") {
    minSize = 1;
    maxSize = 1;
  } else if (formData.teamFormat === "duo") {
    minSize = 2;
    maxSize = 2;
  } else if (formData.teamFormat === "squad_4") {
    minSize = 4;
    maxSize = 4;
  } else {
    minSize = Math.max(1, formData.minTeamSize || 1);
    maxSize = Math.max(minSize, formData.maxTeamSize || 4);
  }

  const { data: newEvent, error } = await supabase
    .from("events")
    .insert({
      title: formData.title.trim(),
      slug,
      category: formData.category,
      description: formData.description.trim(),
      team_format: formData.teamFormat,
      min_team_size: minSize,
      max_team_size: maxSize,
      venue: formData.venue.trim(),
      date: formData.date.trim(),
      time: formData.time.trim(),
      capacity: formData.capacity || 100,
      is_published: formData.isPublished,
      is_registration_open: formData.isRegistrationOpen,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: "EVENT_CREATED",
    entity_type: "event",
    entity_id: newEvent.id,
    details: `Created event '${newEvent.title}' (${formData.teamFormat})`,
  });

  revalidatePath("/coordinator/events");
  revalidatePath("/coordinator");
  revalidatePath("/app/events");
  return { success: true, eventId: newEvent.id };
}

// 2. TOGGLE EVENT STATUS (PUBLISH / REGISTRATION)
export async function toggleEventStatus(
  eventId: string,
  field: "is_published" | "is_registration_open",
  value: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator") {
    return { success: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("events")
    .update({ [field]: value })
    .eq("id", eventId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: `EVENT_${field.toUpperCase()}_UPDATED`,
    entity_type: "event",
    entity_id: eventId,
    details: `Updated ${field} to ${value}`,
  });

  revalidatePath("/coordinator/events");
  revalidatePath("/app/events");
  return { success: true };
}

// 3. DELETE EVENT
export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator") {
    return { success: false, error: "Forbidden" };
  }

  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", eventId)
    .single();

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: "EVENT_DELETED",
    entity_type: "event",
    entity_id: eventId,
    details: `Deleted event '${event?.title || eventId}'`,
  });

  revalidatePath("/coordinator/events");
  revalidatePath("/coordinator");
  revalidatePath("/app/events");
  return { success: true };
}

// 4. RECORD ATTENDANCE CHECK-IN (QR SCAN OR USN)
export async function recordAttendance(params: {
  eventId: string;
  passTokenOrUsn: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: coordinatorProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (coordinatorProfile?.role !== "coordinator") {
    return { success: false, error: "Forbidden" };
  }

  const tokenOrUsn = params.passTokenOrUsn.trim();
  if (!tokenOrUsn) {
    return { success: false, error: "Please enter a valid pass token or USN." };
  }

  // Lookup profile by pass_token or usn
  let participantQuery = supabase.from("profiles").select("*");
  if (tokenOrUsn.length >= 16) {
    participantQuery = participantQuery.eq("pass_token", tokenOrUsn);
  } else {
    participantQuery = participantQuery.ilike("usn", tokenOrUsn);
  }

  const { data: participant, error: pErr } = await participantQuery.single();

  if (pErr || !participant) {
    return {
      success: false,
      error: `No participant found matching '${tokenOrUsn}'. Please verify USN or pass barcode.`,
    };
  }

  // Verify participant is registered for this event
  const { data: membership } = await supabase
    .from("team_members")
    .select("*, teams(*)")
    .eq("event_id", params.eventId)
    .eq("user_id", participant.id)
    .single();

  // Fetch event title
  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", params.eventId)
    .single();

  // Check for duplicate check-in
  const { data: existingScan } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("event_id", params.eventId)
    .eq("user_id", participant.id)
    .single();

  if (existingScan) {
    return {
      success: false,
      isDuplicate: true,
      participant: {
        id: participant.id,
        fullName: participant.full_name,
        usn: participant.usn,
        department: participant.department,
        teamName: membership?.teams?.name || "Solo Entry",
      },
      scannedAt: existingScan.scanned_at,
      error: `Already checked in at ${new Date(existingScan.scanned_at).toLocaleTimeString()}`,
    };
  }

  // Insert attendance record
  const { data: newLog, error: attErr } = await supabase
    .from("attendance_logs")
    .insert({
      event_id: params.eventId,
      user_id: participant.id,
      scanned_by: user.id,
      notes: params.notes || "Live Gate Check-in",
    })
    .select()
    .single();

  if (attErr) {
    return { success: false, error: attErr.message };
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: coordinatorProfile.full_name || user.email,
    actor_role: "coordinator",
    action: "ATTENDANCE_CHECKIN",
    entity_type: "attendance_log",
    entity_id: newLog.id,
    details: `Checked in participant ${participant.full_name} (${participant.usn || participant.email}) for event: ${event?.title || params.eventId}`,
  });

  revalidatePath("/coordinator/attendance");
  return {
    success: true,
    participant: {
      id: participant.id,
      fullName: participant.full_name,
      usn: participant.usn,
      department: participant.department,
      teamName: membership?.teams?.name || (membership ? "Solo Entry" : "Walk-in Approved"),
    },
    scannedAt: newLog.scanned_at,
  };
}

// 5. CREATE ANNOUNCEMENT
export async function createAnnouncement(formData: {
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  isPinned: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator") {
    return { success: false, error: "Forbidden" };
  }

  const { data: newAnn, error } = await supabase
    .from("announcements")
    .insert({
      title: formData.title.trim(),
      content: formData.content.trim(),
      priority: formData.priority,
      author_id: user.id,
      author_name: profile.full_name || "DATIN Coordinator",
      is_pinned: formData.isPinned,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: "ANNOUNCEMENT_PUBLISHED",
    entity_type: "announcement",
    entity_id: newAnn.id,
    details: `Published announcement: '${newAnn.title}' (${newAnn.priority})`,
  });

  revalidatePath("/coordinator/announcements");
  revalidatePath("/app/dashboard");
  return { success: true };
}

// 6. DELETE ANNOUNCEMENT
export async function deleteAnnouncement(announcementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator") return { success: false, error: "Forbidden" };

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: "ANNOUNCEMENT_DELETED",
    entity_type: "announcement",
    entity_id: announcementId,
    details: `Deleted announcement ${announcementId}`,
  });

  revalidatePath("/coordinator/announcements");
  revalidatePath("/app/dashboard");
  return { success: true };
}

// 7. INVITE COORDINATOR (ADMIN-CONTROLLED, EXPIRING, SINGLE-USE)
export async function inviteCoordinator(email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized: Sign in required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, account_status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator" || profile?.account_status !== "active") {
    return { success: false, error: "Forbidden: Only active coordinators can invite peers." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiration

  // Insert or refresh pending invite
  const { data: newInvite, error } = await supabase
    .from("coordinator_invites")
    .upsert(
      {
        email: cleanEmail,
        invited_by: user.id,
        status: "pending",
        expires_at: expiresAt,
        accepted_at: null,
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // If user is already registered in the system, promote them directly
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingUser) {
    await supabase
      .from("profiles")
      .update({ role: "coordinator", onboarding_completed: true })
      .eq("id", existingUser.id);

    await supabase
      .from("coordinator_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", newInvite.id);

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_name: profile.full_name || user.email,
      actor_role: "coordinator",
      action: "COORDINATOR_PROMOTED",
      entity_type: "profile",
      entity_id: existingUser.id,
      details: `Existing participant account ${cleanEmail} upgraded to coordinator.`,
    });
  } else {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_name: profile.full_name || user.email,
      actor_role: "coordinator",
      action: "COORDINATOR_INVITED",
      entity_type: "coordinator_invite",
      entity_id: newInvite.id,
      details: `Created 7-day single-use coordinator invitation for ${cleanEmail} (Expires: ${expiresAt}).`,
    });
  }

  revalidatePath("/coordinator/invites");
  return { success: true, expiresAt };
}

// 8. REVOKE COORDINATOR INVITE
export async function revokeCoordinatorInvite(inviteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, account_status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coordinator" || profile?.account_status !== "active") {
    return { success: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("coordinator_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: profile.full_name || user.email,
    actor_role: "coordinator",
    action: "COORDINATOR_INVITE_REVOKED",
    entity_type: "coordinator_invite",
    entity_id: inviteId,
    details: `Revoked coordinator invitation ID: ${inviteId}`,
  });

  revalidatePath("/coordinator/invites");
  return { success: true };
}

// 9. SUSPEND COORDINATOR (WITH LAST-COORDINATOR PROTECTION)
export async function suspendCoordinator(targetCoordinatorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: actingProfile } = await supabase
    .from("profiles")
    .select("role, full_name, account_status")
    .eq("id", user.id)
    .single();

  if (actingProfile?.role !== "coordinator" || actingProfile?.account_status !== "active") {
    return { success: false, error: "Forbidden: Active coordinator credentials required." };
  }

  // Last-coordinator protection rule
  const { count: activeCoordCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "coordinator")
    .eq("account_status", "active");

  if (activeCoordCount !== null && activeCoordCount <= 1) {
    return {
      success: false,
      error: "Security Policy: Cannot suspend the last remaining active coordinator. The organization must retain at least one active administrator.",
    };
  }

  // Fetch target info
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", targetCoordinatorId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ account_status: "suspended" })
    .eq("id", targetCoordinatorId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: actingProfile.full_name || user.email,
    actor_role: "coordinator",
    action: "COORDINATOR_SUSPENDED",
    entity_type: "profile",
    entity_id: targetCoordinatorId,
    details: `Suspended coordinator access for ${targetProfile?.full_name || targetCoordinatorId} (${targetProfile?.email}).`,
  });

  revalidatePath("/coordinator/invites");
  return { success: true };
}

// 10. RESTORE COORDINATOR
export async function restoreCoordinator(targetCoordinatorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: actingProfile } = await supabase
    .from("profiles")
    .select("role, full_name, account_status")
    .eq("id", user.id)
    .single();

  if (actingProfile?.role !== "coordinator" || actingProfile?.account_status !== "active") {
    return { success: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ account_status: "active" })
    .eq("id", targetCoordinatorId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: actingProfile.full_name || user.email,
    actor_role: "coordinator",
    action: "COORDINATOR_RESTORED",
    entity_type: "profile",
    entity_id: targetCoordinatorId,
    details: `Restored coordinator access for ${targetCoordinatorId}.`,
  });

  revalidatePath("/coordinator/invites");
  return { success: true };
}

// 11. APPROVE PARTICIPANT MEMBERSHIP
export async function approveParticipantMembership(participantId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: actingProfile } = await supabase
    .from("profiles")
    .select("role, full_name, account_status")
    .eq("id", user.id)
    .single();

  if (actingProfile?.role !== "coordinator" || actingProfile?.account_status !== "active") {
    return { success: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ membership_status: "approved" })
    .eq("id", participantId);

  if (error) return { success: false, error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_name: actingProfile.full_name || user.email,
    actor_role: "coordinator",
    action: "PARTICIPANT_MEMBERSHIP_APPROVED",
    entity_type: "profile",
    entity_id: participantId,
    details: `Approved membership for participant ${participantId}.`,
  });

  revalidatePath("/coordinator/invites");
  return { success: true };
}
