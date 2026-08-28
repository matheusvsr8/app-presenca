'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env');
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

  if (!user || user?.user_metadata?.role !== 'ADMIN' || !tenantId) {
    throw new Error('Acesso negado');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const qrCode = `qr-${tenantId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const adminClient = getAdminClient();

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password: '123456change', // Senha provisória
    email_confirm: true,
    user_metadata: {
      name,
      role: 'STUDENT',
      tenantId,
      qrCode
    }
  });

  if (error || !newUser.user) {
    throw new Error(error?.message || 'Erro ao criar aluno');
  }

  await prisma.user.create({
    data: {
      id: newUser.user.id,
      name,
      email,
      role: 'STUDENT',
      qrCode,
      tenantId,
    },
  });

  redirect('/admin/students');
}
