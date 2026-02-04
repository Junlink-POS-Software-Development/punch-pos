import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // ============================================
  // MAINTENANCE MODE GUARD
  // ============================================
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = request.nextUrl.pathname === "/maintenance";
  const hasAdminCookie = request.cookies.get("admin")?.value === "true";

  // If maintenance mode is enabled
  if (isMaintenanceMode) {
    // Allow access to the maintenance page itself (to avoid redirect loops)
    if (isMaintenancePage) {
      return NextResponse.next();
    }

    // Allow admins with the special cookie to bypass maintenance
    if (hasAdminCookie) {
      // Continue to normal middleware flow
    } else {
      // Redirect all other traffic to the maintenance page
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } else {
    // If maintenance mode is OFF, redirect away from maintenance page
    if (isMaintenancePage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ============================================
  // NORMAL MIDDLEWARE FLOW
  // ============================================
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Authenticate User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================================
  // AUTHENTICATION GUARD
  // ============================================
  // Define public routes that don't require authentication
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = isLoginPage || isApiRoute || isMaintenancePage || isAuthRoute;

  // If user is not logged in and trying to access a protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and trying to access login page, redirect to home
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ============================================
  // ACCOUNT STATUS GUARD
  // ============================================
  if (user && !isApiRoute) {
    const { data: statusData, error: statusError } = await supabase.rpc(
      "check_account_status"
    );

    if (!statusError && statusData) {
      const status = (statusData as any).status;
      const currentPath = request.nextUrl.pathname;

      // 1. User Deleted/Deactivated
      if (status === "user_deleted") {
        if (!currentPath.startsWith("/reactivate")) {
           // Clear session cookies to force them out of valid auth state if needed,
           // but here we redirect to a public reactivate page or similar.
           return NextResponse.redirect(new URL("/reactivate", request.url));
        }
      } 
      // 2. Store Delayed/No Store -> Redirect to Settings
      else if (
        (status === "store_deleted" || status === "no_store")
      ) {
         // Allow access to settings to fix the issue
         if (!currentPath.startsWith("/settings") && !currentPath.startsWith("/login")) {
            const redirectUrl = new URL("/settings", request.url);
            if (status === "store_deleted") {
              redirectUrl.searchParams.set("reason", "store_deleted");
            }
            return NextResponse.redirect(redirectUrl);
         }
      }
      
      // If we are on reactivate page but status Is active, go home
      if (status === "active" && currentPath.startsWith("/reactivate")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // ============================================
  // SUBSCRIPTION GUARD LOGIC
  // ============================================
  if (user) {
    // Check if user belongs to a store and has completed profile
    const { data: userData } = await supabase
      .from("users")
      .select("store_id, first_name, last_name, metadata")
      .eq("user_id", user.id)
      .single();

    const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding");

    const hasStore = !!userData?.store_id;
    const hasName = !!userData?.first_name && !!userData?.last_name;
    const jobTitle = (userData?.metadata as { job_title?: string })?.job_title;
    const hasJobTitle = !!jobTitle;

    const isProfileComplete = hasStore && hasName && hasJobTitle;

    if (!isProfileComplete) {
      // If user has incomplete profile, redirect to onboarding
      if (!isOnboardingPage && !isApiRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    } else {
      // Check subscription status for that store
      const { data: sub } = await supabase
        .from("store_subscriptions")
        .select("status, end_date")
        .eq("store_id", userData.store_id)
        .single();

      const now = new Date();
      const endDate = sub?.end_date ? new Date(sub.end_date) : null;

      // Consider active if status is PAID and date is in the future
      const isActive = sub?.status === "PAID" && endDate && endDate > now;

      // Define paths to exempt (so they don't get stuck in a redirect loop)
      const isSubscriptionPage =
        request.nextUrl.pathname.startsWith("/settings") ||
        request.nextUrl.pathname.startsWith("/subscribe-required");

      // If inactive and NOT on the subscription page, redirect them
      if (!isActive && !isSubscriptionPage && !isApiRoute) {
        // Redirect to your subscription settings page
        return NextResponse.redirect(new URL("/subscribe-required", request.url));
      }
    }
  }


  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
