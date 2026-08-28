'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function deleteStudent(studentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.tenantId;

  if (!user || user?.user_metadata?.role !== 'ADMIN' || !tenantId) {
    throw new Error('Acesso negado');
  }

  await prisma.user.delete({
    where: {
      id: studentId,
      tenantId // Ensure it belongs to this tenant
    }
  });

  redirect('/admin/students');
}
