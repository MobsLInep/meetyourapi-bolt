import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up'],
  // afterAuth(auth, req, evt) {
  //   // Handle users who aren't authenticated
  //   if (!auth.userId && !auth.isPublicRoute) {
  //     const signInUrl = new URL('/sign-in', req.url);
  //     signInUrl.searchParams.set('redirect_url', req.url);
  //     return Response.redirect(signInUrl);
  //   }
  // }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 