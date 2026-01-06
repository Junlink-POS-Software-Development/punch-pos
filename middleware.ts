import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
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

  // 2. SUBSCRIPTION GUARD LOGIC
  if (user) {
    // Check if user belongs to a store
    const { data: member } = await supabase
      .from("members")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (member?.store_id) {
      // Check subscription status for that store
      const { data: sub } = await supabase
        .from("store_subscriptions")
        .select("status, end_date")
        .eq("store_id", member.store_id)
        .single();

      const now = new Date();
      const endDate = sub?.end_date ? new Date(sub.end_date) : null;

      // Consider active if status is PAID and date is in the future
      const isActive = sub?.status === "PAID" && endDate && endDate > now;

      // Define paths to exempt (so they don't get stuck in a redirect loop)
      const isSubscriptionPage =
        request.nextUrl.pathname.startsWith("/settings") ||
        request.nextUrl.pathname.startsWith("/subscribe-required"); // Assuming settings is where subscription is
      const isApiRoute = request.nextUrl.pathname.startsWith("/api");

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
