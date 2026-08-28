import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextUrl = request.nextUrl;
  const isLoggedIn = !!user;
  
  // Pegamos a "role" dos metadados do Supabase
  const role = user?.user_metadata?.role;

  const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register') || nextUrl.pathname.startsWith('/verify-email');
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'STUDENT') return NextResponse.redirect(new URL('/student', nextUrl));
      if (role === 'COLLABORATOR') return NextResponse.redirect(new URL('/scanner', nextUrl));
      return NextResponse.redirect(new URL('/admin', nextUrl));
    }
    return supabaseResponse;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Controle de acesso por perfis
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (nextUrl.pathname.startsWith('/scanner') && role !== 'ADMIN' && role !== 'COLLABORATOR') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (nextUrl.pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return supabaseResponse;
}
