import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/shop(.*)",
  "/wines(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/api/newsletter(.*)",
  "/api/payment/verify(.*)",
  "/payment/verify(.*)",
  "/liked(.*)",
  "/cart(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(
  async (auth, request) => {
    // Skip auth if Clerk is not configured
    const isClerkConfigured = !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
      process.env.CLERK_SECRET_KEY
    );

    if (!isClerkConfigured) {
      return;
    }

    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    // Disable auth requirement globally if not configured
    debug: false,
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
