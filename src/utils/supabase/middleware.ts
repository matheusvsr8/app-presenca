import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
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
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!user;

  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/verify-email');

  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/scanner') || 
    pathname.startsWith('/student');

  // 1. Se estiver logado e tentar acessar tela de login/cadastro -> envia para a raiz (que roteia via banco)
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 2. Se NÃO estiver logado e tentar rota protegida -> manda para o login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return supabaseResponse;
}
