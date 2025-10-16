import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromHeaders, getMainDomainUrl } from './utils/tenant';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and special Next.js files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  try {
    // Get tenant information from request headers
    const tenant = getTenantFromHeaders(request.headers);

    // If it's central domain, allow all requests
    if (tenant.isCentral) {
      return NextResponse.next();
    }

    // For tenant subdomains, handle routing logic
    // Only restrict access to marketing pages, allow all app functionality
    const restrictedTenantRoutes = ['/'];
    const isRestrictedRoute = restrictedTenantRoutes.includes(pathname);
    
    // If trying to access restricted routes on tenant domain, redirect to signin
    if (isRestrictedRoute) {
      const signinUrl = new URL('/signin', request.url);
      return NextResponse.redirect(signinUrl);
    }

    // For tenant subdomains, validate with API
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.atomsuit.test/api';
    
    try {
      const response = await fetch(`${apiUrl}`, {
        headers: {
          'X-Tenant': tenant.subdomain,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // Check if tenant validation was successful
      if (data.error === false && data.code === 200) {
        // Tenant is valid, continue with the request
        return NextResponse.next();
      } else {
        // Tenant validation failed, redirect to main domain
        return NextResponse.redirect(getMainDomainUrl());
      }
    } catch {
      // If API call fails, redirect to main domain for safety
      return NextResponse.redirect(getMainDomainUrl());
    }

  } catch {
    // In case of any error, allow the request to continue in development
    // but redirect in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(getMainDomainUrl());
    }

    return NextResponse.next();
  }
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)',
  ],
};