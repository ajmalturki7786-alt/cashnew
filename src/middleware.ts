import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
const adminRoutes = ['/admin', '/xadmin2024'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for admin routes - handled client-side
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    return NextResponse.next();
  }
  
  // Check if there's an auth token in cookies or localStorage
  // Note: middleware runs on the edge, so we can only check cookies
  const token = request.cookies.get('accessToken')?.value;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing a protected route without a token, redirect to login
  // Note: We'll handle this client-side as localStorage is more reliable for SPAs
  // This middleware is optional and mainly for edge cases

  // If accessing auth routes with a token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
