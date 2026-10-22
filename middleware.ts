import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xgbwadomxmtzjlqdwfxb.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Coordinator Routes Guard: /coordinator/*
  if (pathname.startsWith("/coordinator")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Fetch user profile from DB to verify trusted role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed, account_status")
      .eq("id", user.id)
      .single();

    if (profile?.account_status === "suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_suspended");
      return NextResponse.redirect(url);
    }

    if (!profile || profile.role !== "coordinator" || profile.account_status !== "active") {
      // Deny participant access with safe redirect
      const url = request.nextUrl.clone();
      url.pathname = "/app/dashboard";
      url.searchParams.set("error", "forbidden_coordinator_only");
      return NextResponse.redirect(url);
    }
  }

  // 2. Participant Routes Guard: /app/*
  if (pathname.startsWith("/app")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role, account_status")
      .eq("id", user.id)
      .single();

    if (profile?.account_status === "suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_suspended");
      return NextResponse.redirect(url);
    }

    // Intentional routing policy: Coordinators belong in /coordinator
    if (profile?.role === "coordinator") {
      const url = request.nextUrl.clone();
      url.pathname = "/coordinator";
      return NextResponse.redirect(url);
    }

    // Check onboarding completion for participants
    if (!pathname.startsWith("/app/onboarding")) {
      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/app/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  // 3. Prevent logged-in users from seeing login screen again
  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === "coordinator") {
      url.pathname = "/coordinator";
    } else {
      url.pathname = "/app/dashboard";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/coordinator/:path*",
    "/app/:path*",
    "/login",
    "/auth/:path*",
  ],
};
