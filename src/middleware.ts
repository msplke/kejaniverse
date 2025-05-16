import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
]);

/**
 * Middleware to protect routes and redirect to sign-in if not authenticated.
 * This middleware checks if the user is authenticated and redirects to the sign-in page
 * if they are not, except for public routes.
 *
 * @param auth - The authentication function from Clerk.
 * @param req - The request object.
 * @returns {Promise<void>} - A promise that resolves when the middleware is complete.
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
