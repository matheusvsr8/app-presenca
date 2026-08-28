'use server';

import { createClient } from '@/utils/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { requiresVerification: true, email };
    }
    return { error: 'Credenciais inválidas.' };
  }

  return { success: true };
}
