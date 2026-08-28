'use server';

import { createClient } from '@/utils/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { requiresVerification: true, email };
    }
    throw new Error('Credenciais inválidas.');
  }

  return { success: true };
}
