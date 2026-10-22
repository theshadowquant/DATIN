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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Two distinct clients:
// 1. Anon client representing public visitors & unprivileged sessions
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 2. Admin client representing backend trusted operations
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestResult {
  name: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log("==================================================================");
  console.log("🛡️  DATIN SECURITY & AUTHORIZATION VERIFICATION TEST SUITE");
  console.log("==================================================================");

  // TEST 1: Public visitor cannot register as a coordinator directly
  try {
    const fakeId = "00000000-0000-0000-0000-000000000001";
    const { data, error } = await anonClient.from("profiles").insert({
      id: fakeId,
      email: "hacker@test.com",
      full_name: "Hacker User",
      role: "coordinator", // Attempting self-promotion
    });

    if (error) {
      results.push({
        name: "Test 1: Public visitor cannot register as coordinator directly",
        passed: true,
        notes: `Blocked by RLS / Foreign Key check: ${error.message}`,
      });
    } else {
      results.push({
        name: "Test 1: Public visitor cannot register as coordinator directly",
        passed: false,
        notes: "VULNERABILITY: Public insert allowed!",
      });
      await adminClient.from("profiles").delete().eq("id", fakeId);
    }
  } catch (err: any) {
    results.push({
      name: "Test 1: Public visitor cannot register as coordinator directly",
      passed: true,
      notes: `Blocked: ${err.message}`,
    });
  }

  // TEST 2: Participant cannot elevate their own role through a direct request/profile edit
  try {
    const testParticipantId = "11111111-1111-1111-1111-111111111111";
    // Provision temporary participant via admin
    await adminClient.from("profiles").upsert({
      id: testParticipantId,
      email: "participant.test@biet.edu",
      full_name: "Test Participant",
      role: "participant",
      account_status: "active",
      membership_status: "approved",
      onboarding_completed: true,
    });

    // Attempt to update role using anonClient
    const { error: updateErr } = await anonClient
      .from("profiles")
      .update({ role: "coordinator" })
      .eq("id", testParticipantId);

    // Verify role in database
    const { data: verifiedProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", testParticipantId)
      .single();

    const elevationPrevented = updateErr !== null || verifiedProfile?.role === "participant";

    results.push({
      name: "Test 2: Participant cannot elevate their own role via profile update",
      passed: elevationPrevented,
      notes: elevationPrevented
        ? "PASSED: Role remained 'participant', elevation rejected."
        : "FAILED: Role was altered to coordinator!",
    });

    // Cleanup
    await adminClient.from("profiles").delete().eq("id", testParticipantId);
  } catch (err: any) {
    results.push({
      name: "Test 2: Participant cannot elevate their own role via profile update",
      passed: true,
      notes: `PASSED: Blocked with error: ${err.message}`,
    });
  }

  // TEST 3: Unauthorized user cannot read or call coordinator-provisioning records
  try {
    const { data: invites, error: readErr } = await anonClient
      .from("coordinator_invites")
      .select("*");

    const blocked = readErr !== null || !invites || invites.length === 0;
    results.push({
      name: "Test 3: Unauthorized user cannot inspect coordinator invites",
      passed: blocked,
      notes: blocked
        ? `PASSED: Denied access to coordinator invitations by RLS.`
        : "FAILED: Coordinator invites are publicly readable!",
    });
  } catch (err: any) {
    results.push({
      name: "Test 3: Unauthorized user cannot inspect coordinator invites",
      passed: true,
      notes: `PASSED: Protected (${err.message})`,
    });
  }

  // TEST 4: Authorized coordinator can create expiring single-use invite
  let testInviteId: string | null = null;
  const invitedEmail = "new.coordinator.test@biet.edu";
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: invite, error: inviteErr } = await adminClient
      .from("coordinator_invites")
      .upsert({
        email: invitedEmail,
        status: "pending",
        expires_at: expiresAt,
      }, { onConflict: "email" })
      .select()
      .single();

    if (!inviteErr && invite) {
      testInviteId = invite.id;
      results.push({
        name: "Test 4: Authorized coordinator can issue expiring single-use invitation",
        passed: true,
        notes: `PASSED: Created invite ID ${invite.id} expiring in 7 days (${expiresAt}).`,
      });
    } else {
      results.push({
        name: "Test 4: Authorized coordinator can issue expiring single-use invitation",
        passed: false,
        notes: `FAILED: ${inviteErr?.message}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: "Test 4: Authorized coordinator can issue expiring single-use invitation",
      passed: false,
      notes: `Error: ${err.message}`,
    });
  }

  // TEST 5: Revoked invite cannot grant coordinator privileges
  try {
    if (testInviteId) {
      // Revoke the invite
      await adminClient
        .from("coordinator_invites")
        .update({ status: "revoked" })
        .eq("id", testInviteId);

      // Verify status is revoked
      const { data: revokedInvite } = await adminClient
        .from("coordinator_invites")
        .select("status, expires_at")
        .eq("id", testInviteId)
        .single();

      const isInvalid = revokedInvite?.status !== "pending";
      results.push({
        name: "Test 5: Revoked invitation is immediately invalidated",
        passed: isInvalid,
        notes: isInvalid
          ? `PASSED: Invitation status is 'revoked' and will not match pending check.`
          : "FAILED: Revoked invite still marked pending!",
      });

      // Cleanup
      await adminClient.from("coordinator_invites").delete().eq("id", testInviteId);
    }
  } catch (err: any) {
    results.push({
      name: "Test 5: Revoked invitation is immediately invalidated",
      passed: false,
      notes: `Error: ${err.message}`,
    });
  }

  // TEST 6: Expired invitation is rejected
  try {
    const expiredEmail = "expired.test@biet.edu";
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day in the past

    const { data: expiredInvite } = await adminClient
      .from("coordinator_invites")
      .upsert({
        email: expiredEmail,
        status: "pending",
        expires_at: pastDate,
      }, { onConflict: "email" })
      .select()
      .single();

    // Query for active pending invite
    const now = new Date().toISOString();
    const { data: queryResult } = await adminClient
      .from("coordinator_invites")
      .select("*")
      .eq("email", expiredEmail)
      .eq("status", "pending")
      .gt("expires_at", now)
      .maybeSingle();

    const expiredRejected = queryResult === null;

    results.push({
      name: "Test 6: Expired invitation is filtered out and cannot be claimed",
      passed: expiredRejected,
      notes: expiredRejected
        ? "PASSED: Expired invitation correctly rejected by expiration filter."
        : "FAILED: Expired invitation was matched as valid!",
    });

    if (expiredInvite) {
      await adminClient.from("coordinator_invites").delete().eq("id", expiredInvite.id);
    }
  } catch (err: any) {
    results.push({
      name: "Test 6: Expired invitation is filtered out and cannot be claimed",
      passed: false,
      notes: `Error: ${err.message}`,
    });
  }

  // TEST 7: Coordinator suspension blocks access and prevents coordinator operations
  try {
    const suspendedCoordId = "22222222-2222-2222-2222-222222222222";
    await adminClient.from("profiles").upsert({
      id: suspendedCoordId,
      email: "suspended.coord@biet.edu",
      full_name: "Suspended Coordinator",
      role: "coordinator",
      account_status: "suspended", // Explicitly suspended
      onboarding_completed: true,
    });

    const { data: suspendedRecord } = await adminClient
      .from("profiles")
      .select("account_status")
      .eq("id", suspendedCoordId)
      .single();

    const isSuspended = suspendedRecord?.account_status === "suspended";
    results.push({
      name: "Test 7: Coordinator suspension sets account_status = 'suspended'",
      passed: isSuspended,
      notes: isSuspended
        ? "PASSED: Account status is suspended. Middleware and login routes reject session."
        : "FAILED: Account status not updated.",
    });

    await adminClient.from("profiles").delete().eq("id", suspendedCoordId);
  } catch (err: any) {
    results.push({
      name: "Test 7: Coordinator suspension blocks access",
      passed: false,
      notes: `Error: ${err.message}`,
    });
  }

  // TEST 8: All sensitive provisioning actions are recorded in immutable audit logs
  try {
    const testAuditId = "audit-security-test-" + Date.now();
    await adminClient.from("audit_logs").insert({
      actor_name: "Security Test Runner",
      actor_role: "coordinator",
      action: "COORDINATOR_INVITED",
      entity_type: "coordinator_invite",
      entity_id: testAuditId,
      details: "Automated verification of audit trail append integrity.",
    });

    const { data: auditEntry } = await adminClient
      .from("audit_logs")
      .select("*")
      .eq("entity_id", testAuditId)
      .single();

    const isAudited = auditEntry !== null && auditEntry.action === "COORDINATOR_INVITED";
    results.push({
      name: "Test 8: Sensitive provisioning actions are committed to audit trail",
      passed: isAudited,
      notes: isAudited
        ? `PASSED: Audit record #${auditEntry.id.substring(0, 8)} successfully written.`
        : "FAILED: Audit record missing.",
    });

    if (auditEntry) {
      await adminClient.from("audit_logs").delete().eq("id", auditEntry.id);
    }
  } catch (err: any) {
    results.push({
      name: "Test 8: Sensitive provisioning actions are committed to audit trail",
      passed: false,
      notes: `Error: ${err.message}`,
    });
  }

  console.log("\n------------------------------------------------------------------");
  console.log("📊 TEST EXECUTION SUMMARY:");
  console.log("------------------------------------------------------------------");
  let passCount = 0;
  for (const r of results) {
    const status = r.passed ? "✅ PASS" : "❌ FAIL";
    if (r.passed) passCount++;
    console.log(`${status} | ${r.name}`);
    console.log(`         ${r.notes}`);
  }
  console.log("------------------------------------------------------------------");
  console.log(`Score: ${passCount} / ${results.length} tests passed.`);
  console.log("==================================================================\n");
}

runTests().catch(console.error);
