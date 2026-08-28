'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createCourse(formData: FormData) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user || session.user.role !== 'ADMIN' || !tenantId) {
    throw new Error('Acesso negado');
  }

  const name = formData.get('name') as string;

  await prisma.course.create({
    data: {
      name,
      tenantId,
    },
  });

  redirect('/admin/courses');
}
