import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  // ============================================
  // MAINTENANCE MODE GUARD
  // ============================================
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = request.nextUrl.pathname === "/maintenance";
  const hasAdminCookie = request.cookies.get("admin")?.value === "true";

  // If maintenance mode is enabled
  if (isMaintenanceMode) {
    const isPwaAsset = 
      request.nextUrl.pathname === "/manifest.json" || 
      request.nextUrl.pathname === "/sw.js" ||
      request.nextUrl.pathname === "/sw.js.map";

    // Allow access to the maintenance page itself or PWA assets
    if (isMaintenancePage || isPwaAsset) {
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
  let user = null;
  let authError = null;
  let isLikelyOffline = false;

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    user = supabaseUser;
    authError = error;
  } catch (err: any) {
    console.error("Supabase auth check failed (potential offline state):", err.message);
    isLikelyOffline = true;
  }

  // If there's an error and it's a network error/offline
  if (authError) {
    isLikelyOffline = isLikelyOffline || 
      authError.message?.includes("fetch") || 
      authError.message?.includes("network") || 
      authError.message?.includes("fetch failed") ||
      authError.status === 0;
  }

  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  // ============================================
  // AUTHENTICATION GUARD
  // ============================================
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isSelectStorePageP = request.nextUrl.pathname.startsWith("/select-store");
  const isOfflinePage = request.nextUrl.pathname === "/~offline";
  
  const isPwaAsset = 
    request.nextUrl.pathname === "/manifest.json" || 
    request.nextUrl.pathname === "/sw.js" ||
    request.nextUrl.pathname === "/sw.js.map" ||
    request.nextUrl.pathname.startsWith("/punch-icon");

  const isPublicRoute = isLoginPage || isApiRoute || isMaintenancePage || isAuthRoute || isSelectStorePageP || isPwaAsset || isOfflinePage;

  // If user is not logged in and trying to access a protected route
  // [NEW] If we are offline but have an auth cookie, we assume they are logged in to allow PWA to work
  if (!user && !isPublicRoute && !(isLikelyOffline && hasAuthCookie)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and trying to access login page, redirect to home
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ============================================
  // ACCOUNT STATUS GUARD
  // ============================================
  if (user && !isApiRoute && !isLikelyOffline) {
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
  if (user && !isLikelyOffline) {
    // Check if user belongs to a store and has completed profile
    const { data: userData } = await supabase
      .from("users")
      .select("store_id, first_name, last_name, metadata")
      .eq("user_id", user.id)
      .single();

    const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding");
    const isSelectStorePage = request.nextUrl.pathname.startsWith("/select-store");

    const hasStore = !!userData?.store_id;
    const hasName = !!userData?.first_name && !!userData?.last_name;
    const jobTitle = (userData?.metadata as { job_title?: string })?.job_title;
    const hasJobTitle = !!jobTitle;

    // 1. Profile Name/Job not complete -> Onboarding
    if (!hasName || !hasJobTitle) {
      if (!isOnboardingPage && !isApiRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    } 
    // 2. Profile Name/Job complete but no Store selected -> Store Selection
    else if (!hasStore) {
      if (!isSelectStorePage && !isApiRoute && !isOnboardingPage) {
        return NextResponse.redirect(new URL("/select-store", request.url));
      }
    }
    // 3. Everything complete -> Check Subscription
    else {
      // Check subscription status for that store
      const { data: sub, error: subError } = await supabase
        .from("store_subscriptions")
        .select("status, end_date")
        .eq("store_id", userData.store_id)
        .maybeSingle();

      // If the query itself failed (e.g. RLS blocking), don't lock the user out
      if (subError) {
        console.error("Subscription query failed (allowing access):", subError.message);
        // Fail-open: allow access when we can't determine subscription status
        return response;
      }

      // If no subscription record exists, the store has never subscribed -> allow access (trial/free)
      // Only block if a record EXISTS but is expired or not paid
      const hasSubscriptionRecord = !!sub;

      let isExpired = false;
      if (hasSubscriptionRecord) {
        const now = new Date();
        const endDate = sub?.end_date ? new Date(sub.end_date) : null;
        const isPaid = sub?.status === "PAID";
        // Expired = has a record, but it's not paid OR the end_date is in the past
        isExpired = !isPaid || !endDate || endDate <= now;
      }

      // Define paths to exempt (so they don't get stuck in a redirect loop)
      const isExemptPage =
        request.nextUrl.pathname.startsWith("/settings") ||
        request.nextUrl.pathname.startsWith("/subscribe-required") ||
        request.nextUrl.pathname.startsWith("/onboarding") ||
        isSelectStorePage;

      // Only redirect if a subscription record exists AND is expired/unpaid
      // Never block stores that haven't subscribed yet (no record)
      const isDemoUser = user?.is_anonymous;
      
      if (hasSubscriptionRecord && isExpired && !isExemptPage && !isApiRoute && !isDemoUser) {
        return NextResponse.redirect(new URL("/subscribe-required", request.url));
      }
    }
  }


  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
