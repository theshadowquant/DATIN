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
      const userEmail = user.email?.toLowerCase() || "";

      // Fetch or create public.profiles entry
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        // Check coordinator bootstrap rule:
        // If BOOTSTRAP_COORDINATOR_EMAILS contains user email, or email is in coordinator_invites
        const bootstrapEmails = (process.env.BOOTSTRAP_COORDINATOR_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        // Check if any coordinators exist yet in the database
        const { count: coordCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "coordinator");

        const { data: invite } = await supabase
          .from("coordinator_invites")
          .select("id")
          .eq("email", userEmail)
          .single();

        let assignedRole: "coordinator" | "participant" = "participant";
        if (invite) {
          assignedRole = "coordinator";
        } else if ((coordCount === null || coordCount === 0) && bootstrapEmails.includes(userEmail)) {
          assignedRole = "coordinator";
        }

        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";

        await supabase.from("profiles").insert({
          id: user.id,
          email: userEmail,
          full_name: fullName,
          role: assignedRole,
          onboarding_completed: assignedRole === "coordinator", // coordinators skip participant onboarding
        });

        if (assignedRole === "coordinator") {
          return NextResponse.redirect(`${origin}/coordinator`);
        } else {
          return NextResponse.redirect(`${origin}/app/onboarding`);
        }
      } else {
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
