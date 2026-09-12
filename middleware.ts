import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/auth",
  "/reset-password",
  "/aiuto",
  "/diventa-mentore",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const nextWithPath = () => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-heyven-path", path);
    return NextResponse.next({ request: { headers: requestHeaders } });
  };

  let response = nextWithPath();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = nextWithPath();
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = nextWithPath();
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const onboardingDone = user
    ? user.app_metadata?.onboarding_completed === true
    : true;

  const isOnboardingExempt =
    path === "/register" ||
    path === "/login" ||
    path === "/reset-password" ||
    path.startsWith("/auth");

  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    if (path === "/") {
      const hasRegistered =
        request.cookies.get("heyven_registered")?.value === "true";
      url.pathname = hasRegistered ? "/login" : "/register";
      if (hasRegistered) {
        url.searchParams.set("next", path);
      } else {
        url.search = "";
      }
    } else {
      url.pathname = "/login";
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  if (user && !onboardingDone && !isOnboardingExempt) {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = onboardingDone ? "/" : "/register";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && path === "/register" && onboardingDone) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)",
  ],
};
