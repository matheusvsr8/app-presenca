'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cria um cliente admin capaz de criar usuários sem deslogar o admin atual
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

export async function getStaff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN') throw new Error('Unauthorized');

  return await prisma.user.findMany({
    where: { 
      tenantId: user.user_metadata.tenantId,
      role: {
        in: ['ADMIN', 'COLLABORATOR']
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createStaffUser(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !password || !role) {
    throw new Error('Preencha todos os campos');
  }

  const adminClient = getAdminClient();

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Já confirma o email do staff
    user_metadata: {
      name,
      role,
      tenantId: user.user_metadata.tenantId
    }
  });

  if (error || !newUser.user) {
    throw new Error(error?.message || 'Erro ao criar usuário no Supabase');
  }

  // Sincroniza com o Prisma
  await prisma.user.create({
    data: {
      id: newUser.user.id,
      name,
      email,
      role, // ADMIN ou COLLABORATOR
      tenantId: user.user_metadata.tenantId
    }
  });

  revalidatePath('/admin/staff');
}

export async function deleteStaffUser(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN') throw new Error('Unauthorized');

  if (id === user.id) {
    throw new Error('Você não pode excluir sua própria conta.');
  }

  const adminClient = getAdminClient();
  
  // Deleta do Supabase Auth
  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) {
    throw new Error('Erro ao excluir do Supabase: ' + error.message);
  }

  // Deleta do Prisma (se o Supabase deletar primeiro, a constraint garante, mas faremos explicito)
  await prisma.user.delete({
    where: { 
      id,
      tenantId: user.user_metadata.tenantId
    }
  });

  revalidatePath('/admin/staff');
}
