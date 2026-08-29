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
  const role = user?.user_metadata?.role;

  // Determina a rota principal do usuário autenticado
  const userHome = role === 'ADMIN' ? '/admin' : role === 'COLLABORATOR' ? '/scanner' : '/student';

  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/verify-email');

  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/scanner') || 
    pathname.startsWith('/student');

  // 1. Se estiver nas rotas de login/registro e já estiver logado -> envia para a home dele
  if (isAuthRoute && isLoggedIn) {
    if (pathname !== userHome) {
      return NextResponse.redirect(new URL(userHome, nextUrl));
    }
    return supabaseResponse;
  }

  // 2. Se NÃO estiver logado e tentar acessar qualquer rota protegida -> manda para o login
  if (!isLoggedIn && isProtectedRoute) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    return supabaseResponse;
  }

  // 3. Validação de permissões para quem ESTÁ logado:
  if (isLoggedIn) {
    // Apenas ADMIN pode acessar rotas /admin
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      if (pathname !== userHome) {
        return NextResponse.redirect(new URL(userHome, nextUrl));
      }
    }

    // Apenas ADMIN ou COLLABORATOR podem acessar /scanner
    if (pathname.startsWith('/scanner') && role !== 'ADMIN' && role !== 'COLLABORATOR') {
      if (pathname !== '/student') {
        return NextResponse.redirect(new URL('/student', nextUrl));
      }
    }
  }

  return supabaseResponse;
}
