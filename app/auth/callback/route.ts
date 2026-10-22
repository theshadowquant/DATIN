import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/app/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && authData.user) {
      const user = authData.user;
      const userEmail = user.email?.toLowerCase().trim() || "";

      // Fetch existing profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Check if this user is suspended
      if (existingProfile?.account_status === "suspended") {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=account_suspended`);
      }

      // Check for valid, unexpired, pending coordinator invite
      const now = new Date().toISOString();
      const { data: validInvite } = await supabase
        .from("coordinator_invites")
        .select("*")
        .eq("email", userEmail)
        .eq("status", "pending")
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingProfile) {
        // First-time signup
        let assignedRole: "coordinator" | "participant" = "participant";

        // Check if zero coordinators exist (system bootstrap scenario)
        const { count: coordCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "coordinator")
          .eq("account_status", "active");

        const bootstrapEmails = (process.env.BOOTSTRAP_COORDINATOR_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const isBootstrapEligible =
          (coordCount === null || coordCount === 0) &&
          bootstrapEmails.includes(userEmail);

        if (validInvite || isBootstrapEligible) {
          assignedRole = "coordinator";
        }

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        await supabase.from("profiles").insert({
          id: user.id,
          email: userEmail,
          full_name: fullName,
          role: assignedRole,
          account_status: "active",
          membership_status: "approved",
          onboarding_completed: assignedRole === "coordinator",
        });

        // Mark invite accepted if matched
        if (validInvite) {
          await supabase
            .from("coordinator_invites")
            .update({ status: "accepted", accepted_at: now })
            .eq("id", validInvite.id);

          await supabase.from("audit_logs").insert({
            actor_id: user.id,
            actor_name: fullName,
            actor_role: "coordinator",
            action: "COORDINATOR_INVITE_ACCEPTED",
            entity_type: "coordinator_invite",
            entity_id: validInvite.id,
            details: `Coordinator invitation successfully claimed by ${userEmail}`,
          });
        }

        if (assignedRole === "coordinator") {
          return NextResponse.redirect(`${origin}/coordinator`);
        } else {
          return NextResponse.redirect(`${origin}/app/onboarding`);
        }
      } else {
        // Existing user logging in: check if they have a pending invite to upgrade
        if (existingProfile.role === "participant" && validInvite) {
          await supabase
            .from("profiles")
            .update({ role: "coordinator", onboarding_completed: true })
            .eq("id", user.id);

          await supabase
            .from("coordinator_invites")
            .update({ status: "accepted", accepted_at: now })
            .eq("id", validInvite.id);

          await supabase.from("audit_logs").insert({
            actor_id: user.id,
            actor_name: existingProfile.full_name || userEmail,
            actor_role: "coordinator",
            action: "COORDINATOR_INVITE_ACCEPTED",
            entity_type: "coordinator_invite",
            entity_id: validInvite.id,
            details: `Existing participant account ${userEmail} promoted to coordinator via valid invitation.`,
          });

          return NextResponse.redirect(`${origin}/coordinator`);
        }

        if (existingProfile.role === "coordinator") {
          return NextResponse.redirect(`${origin}/coordinator`);
        }

        if (!existingProfile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/app/onboarding`);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`);
}
