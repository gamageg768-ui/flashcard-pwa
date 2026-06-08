import { auth } from '@/lib/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedPaths = ['/dashboard', '/deck', '/study', '/notes'];
  const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname === '/login') {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icons|manifest.json|favicon.ico).*)'],
};
