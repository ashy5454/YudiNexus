import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth/utils';

// Define protected routes
const founderRoutes = ['/founder'];
const employeeRoutes = ['/employee'];
const adminRoutes = ['/admin'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths
  if (path === '/' || path.startsWith('/auth') || path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isFounderRoute = founderRoutes.some((route) => path.startsWith(route));
  const isEmployeeRoute = employeeRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  
  // If not a protected route, let it pass
  if (!isFounderRoute && !isEmployeeRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Get token
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    if (isAdminRoute || isFounderRoute) return NextResponse.redirect(new URL('/auth/founder/login', request.url));
    if (isEmployeeRoute) return NextResponse.redirect(new URL('/auth/login', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const payload = await decrypt(token);
    const userRole = payload.role as string;

    // Role-based routing
    if (isAdminRoute && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/auth/founder/login', request.url));
    }
    
    if (isFounderRoute && userRole !== 'FOUNDER' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/auth/founder/login', request.url));
    }

    if (isEmployeeRoute && userRole !== 'EMPLOYEE' && userRole !== 'FOUNDER' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    if (isFounderRoute) return NextResponse.redirect(new URL('/auth/founder/login', request.url));
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
