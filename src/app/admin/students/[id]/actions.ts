'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function deleteStudent(studentId: string) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user || session.user.role !== 'ADMIN' || !tenantId) {
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
