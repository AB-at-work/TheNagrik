import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Matches "admin.thenagrik.org", "admin.localhost:3000", or any hostname starting with "admin."
  const isAdminSubdomain = host.startsWith('admin.');

  let response = NextResponse.next();

  if (isAdminSubdomain) {
    // Redirect asset folders and system files normally, but rewrite pages
    // e.g. admin.thenagrik.org/ -> /admin
    // e.g. admin.thenagrik.org/settings -> /admin/settings
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      response = NextResponse.rewrite(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo/assets (any other static asset directories if applicable)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$|uploads).*)',
  ],
};
