import { NextResponse, type NextRequest } from 'next/server';

// Lightweight redirect for unauthenticated visitors. The real authorization is enforced by the backend;
// roles are additionally checked in <ProtectedRoute>.
export function middleware(req: NextRequest) {
  if (!req.cookies.has('htf_token')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/student/:path*', '/tutor/:path*'] };
