'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createCourse(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.tenantId;

  if (!user || user?.user_metadata?.role !== 'ADMIN' || !tenantId) {
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
