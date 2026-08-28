import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthRoute = nextUrl.pathname.startsWith('/login');
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'STUDENT') return Response.redirect(new URL('/student', nextUrl));
      if (role === 'COLLABORATOR') return Response.redirect(new URL('/scanner', nextUrl));
      return Response.redirect(new URL('/admin', nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // Controle de acesso por perfis
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return Response.redirect(new URL('/', nextUrl)); // Redireciona para o root que vai rotear corretamente
  }

  if (nextUrl.pathname.startsWith('/scanner') && role === 'STUDENT') {
    return Response.redirect(new URL('/student', nextUrl));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
