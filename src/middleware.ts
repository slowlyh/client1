import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { adminEmail } from '@/lib/firebase/config'

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Routes configuration
const PROTECTED_ROUTES = ['/dashboard', '/dashboard/products', '/dashboard/add-product', '/dashboard/product', '/invoice']
const ADMIN_ONLY_ROUTES = ['/dashboard/products', '/dashboard/add-product', '/dashboard/product']
const PUBLIC_ROUTES = ['/login', '/', '/products', '/product']

// Rate limiting configuration
const RATE_LIMIT = {
  // API routes: 10 requests per minute
  '/api': {
    windowMs: 60 * 1000, // 1 minute
    max: 10
  },
  // Payment routes: 5 requests per minute
  '/api/payment': {
    windowMs: 60 * 1000, // 1 minute
    max: 5
  }
}

// Rate limiting function
function checkRateLimit(identifier: string, limit: number): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    // Create new record or reset expired record
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + 60000 // 1 minute from now
    })
    return { success: true, remaining: limit - 1, resetTime: now + 60000 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }

  // Increment count
  record.count++
  rateLimitStore.set(identifier, record)
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime }
}

// Admin email verification
function isAdmin(email: string | undefined | null): boolean {
  return email === adminEmail
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { origin } = request.nextUrl

  // Check if it's an API route
  const isApiRoute = pathname.startsWith('/api')

  // Rate limiting for API routes
  if (isApiRoute) {
    // Get client identifier (IP address or session token)
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'

    // Find matching rate limit rule
    let rateLimit = RATE_LIMIT['/api']
    for (const [prefix, limit] of Object.entries(RATE_LIMIT)) {
      if (pathname.startsWith(prefix)) {
        rateLimit = limit
        break
      }
    }

    if (rateLimit) {
      const result = checkRateLimit(identifier, rateLimit.max)

      if (!result.success) {
        // Rate limit exceeded
        const response = NextResponse.json(
          {
            status: false,
            message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
            error: 'RATE_LIMIT_EXCEEDED',
            resetTime: new Date(result.resetTime).toISOString()
          },
          { status: 429 }
        )

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', rateLimit.max.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
        response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())

        return response
      }

      // Add rate limit headers (for successful requests)
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', rateLimit.max.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

      return response
    }
  }

  // Auth protection for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // Get token from cookie or header
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if user is authenticated
  const isAuthenticated = !!token

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callback', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin-only routes
  if (isAdminOnlyRoute) {
    // For admin routes, we need to verify admin role
    // Since we don't have the user email in the middleware (we'd need to decode the JWT or fetch user from Firestore),
    // we'll add a header that the server-side pages can check
    const response = NextResponse.next()
    response.headers.set('X-Admin-Only', 'true')
    return response
  }

  // Redirect to dashboard if already authenticated and trying to access login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Continue to the requested page
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes that handle CORS or webhooks (add them here if needed)
    // - static files (images, videos, etc.)
    // - Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|images|videos|js).*)',
  ]
}
