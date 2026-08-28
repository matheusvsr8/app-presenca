import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Redireciona para o login após deslogar
  const url = new URL('/login', request.url);
  return NextResponse.redirect(url);
}
