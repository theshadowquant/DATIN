import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

try {
  const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xgbwadomxmtzjlqdwfxb.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!serviceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local to run the bootstrap procedure.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function bootstrapCoordinator() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail || !targetEmail.includes("@")) {
    console.error("Usage: npx tsx scripts/bootstrap-coordinator.ts <email>");
    console.error("Example: npx tsx scripts/bootstrap-coordinator.ts coordinator@bietdvg.edu");
    process.exit(1);
  }

  console.log(`🔐 Initiating System Owner Bootstrap for: ${targetEmail}`);

  // 1. Check if user already exists in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", targetEmail)
    .maybeSingle();

  if (existingProfile) {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        role: "coordinator",
        account_status: "active",
        onboarding_completed: true,
      })
      .eq("id", existingProfile.id);

    if (updateErr) {
      console.error("❌ Failed to update profile role:", updateErr.message);
      process.exit(1);
    }

    console.log(`✅ Successfully elevated existing user ${targetEmail} to COORDINATOR.`);
  } else {
    // 2. Insert authorized coordinator invitation so they receive coordinator role immediately upon sign-in
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: inviteErr } = await supabase
      .from("coordinator_invites")
      .upsert(
        {
          email: targetEmail,
          status: "pending",
          expires_at: expiresAt,
        },
        { onConflict: "email" }
      );

    if (inviteErr) {
      console.error("❌ Failed to create coordinator pre-authorization invite:", inviteErr.message);
      process.exit(1);
    }

    console.log(`✅ Pre-authorized coordinator invitation created for ${targetEmail}.`);
    console.log(`   When ${targetEmail} signs in via Google or Email OTP, they will automatically be provisioned as COORDINATOR.`);
  }

  // 3. Log audit record
  await supabase.from("audit_logs").insert({
    actor_name: "SYSTEM_OWNER_CLI",
    actor_role: "system_admin",
    action: "INITIAL_COORDINATOR_BOOTSTRAPPED",
    entity_type: "coordinator_provision",
    entity_id: targetEmail,
    details: `Authorized initial coordinator credentials for ${targetEmail} via secure server-side bootstrap procedure.`,
  });

  console.log("📝 Audit record committed to database.");
}

bootstrapCoordinator().catch((err) => {
  console.error("Unexpected error during bootstrap:", err);
  process.exit(1);
});
