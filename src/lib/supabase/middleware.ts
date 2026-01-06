import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected admin routes
  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as { role: string } | null

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Protected staff routes
  if (path.startsWith('/staff')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    // Get user's profile and role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as { role: string } | null

    // Admins and superadmins can access /staff if they have a linked staff record
    if (profile && ['admin', 'superadmin'].includes(profile.role)) {
      // Check if admin has a linked staff record
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, portal_access_enabled')
        .eq('profile_id', user.id)
        .single()

      const staff = staffData as { id: string; portal_access_enabled: boolean } | null

      // Admin with linked staff record can access
      if (staff) {
        return supabaseResponse
      }

      // Admin without linked staff - redirect to admin panel
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Staff role users
    if (profile?.role === 'staff') {
      // Check staff record and access
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, portal_access_enabled')
        .eq('profile_id', user.id)
        .single()

      const staff = staffData as { id: string; portal_access_enabled: boolean } | null

      if (!staff) {
        // No staff record found - shouldn't happen but handle it
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      if (!staff.portal_access_enabled) {
        // Access has been revoked
        const url = request.nextUrl.clone()
        url.pathname = '/acceso-revocado'
        return NextResponse.redirect(url)
      }

      // Staff with access enabled - allow
      return supabaseResponse
    }

    // Client or other roles - no access to staff portal
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Protected client routes
  if (path.startsWith('/mis-citas')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
