'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
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

export async function updateUserRole(userId: string, newRole: 'STUDENT' | 'COLLABORATOR' | 'ADMIN') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

  if (!user || user?.user_metadata?.role !== 'ADMIN' || !tenantId) {
    return { success: false, error: 'Acesso negado. Apenas administradores podem alterar permissões.' };
  }

  try {
    // 1. Atualiza na tabela pública do Prisma
    const updatedUser = await prisma.user.update({
      where: { id: userId, tenantId },
      data: { role: newRole }
    });

    // 2. Atualiza os metadados no Supabase Auth usando o Admin API se disponível
    const adminClient = getAdminClient();
    if (adminClient) {
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });
    }

    // 3. Atualiza diretamente via Raw SQL no auth.users como garantia absoluta
    try {
      await prisma.$executeRaw`
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', ${newRole}) 
        WHERE id = ${userId}::uuid;
      `;
    } catch (sqlErr) {
      console.warn('Nota sobre Raw SQL auth update:', sqlErr);
    }

    revalidatePath(`/admin/students/${userId}`);
    revalidatePath('/admin/students');
    revalidatePath('/admin/staff');

    return { 
      success: true, 
      message: `Permissão de ${updatedUser.name} alterada para ${newRole === 'ADMIN' ? 'Administrador' : newRole === 'COLLABORATOR' ? 'Colaborador' : 'Aluno'} com sucesso!` 
    };
  } catch (error: any) {
    console.error('Erro ao atualizar permissão:', error);
    return { success: false, error: error.message || 'Erro ao alterar permissão do usuário.' };
  }
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

  if (!user || user?.user_metadata?.role !== 'ADMIN' || !tenantId) {
    throw new Error('Acesso negado');
  }

  await prisma.user.delete({
    where: {
      id: studentId,
      tenantId
    }
  });

  redirect('/admin/students');
}
