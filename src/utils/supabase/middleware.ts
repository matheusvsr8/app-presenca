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

  // Função utilitária para descobrir a rota de destino do usuário autenticado
  const getHomeRoute = (userRole?: string) => {
    if (userRole === 'ADMIN') return '/admin';
    if (userRole === 'COLLABORATOR') return '/scanner';
    return '/student';
  };

  const isAuthRoute = 
    nextUrl.pathname.startsWith('/login') || 
    nextUrl.pathname.startsWith('/register') || 
    nextUrl.pathname.startsWith('/verify-email');
  
  // 1. Se já estiver logado e tentar abrir rotas de login/cadastro, manda direto para a sua área
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getHomeRoute(role), nextUrl));
    }
    return supabaseResponse;
  }

  // 2. Se NÃO estiver logado e tentar rota protegida (diferente da splash raiz)
  if (!isLoggedIn && nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 3. Proteção das áreas: se logado mas sem permissão para aquela rota específica,
  // redireciona DIRETO para a Home correta do usuário (evitando ping-pong com /login)
  if (isLoggedIn) {
    if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getHomeRoute(role), nextUrl));
    }

    if (nextUrl.pathname.startsWith('/scanner') && role !== 'ADMIN' && role !== 'COLLABORATOR') {
      return NextResponse.redirect(new URL(getHomeRoute(role), nextUrl));
    }

    if (nextUrl.pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL(getHomeRoute(role), nextUrl));
    }
  }

  return supabaseResponse;
}
