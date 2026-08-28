import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO CRÍTICO: Variáveis do Supabase ausentes no ambiente!");
    // Se as variáveis estiverem ausentes (ex: na Vercel), o app não tem como funcionar.
    return NextResponse.next(); 
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextUrl = request.nextUrl;
  const isLoggedIn = !!user;
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

  if (!isLoggedIn && nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

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
