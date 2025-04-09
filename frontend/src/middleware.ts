import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user has a session cookie
  const sessionCookie = request.cookies.get('appwrite-session');

  // Define protected routes that require authentication
  const protectedRoutes = ['/account', '/orders', '/wishlist'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth pages with a session, redirect to account
  const authRoutes = ['/auth/login', '/auth/signup'];
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname === route
  );

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/account/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/auth/:path*',
  ],
};
