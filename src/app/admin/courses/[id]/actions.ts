'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(courseId: string, studentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.create({
    data: { courseId, studentId }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function removeStudent(courseId: string, studentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.delete({
    where: { studentId_courseId: { studentId, courseId } }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.tenantId;
  
  if (user?.role !== 'ADMIN' || !tenantId) throw new Error('Acesso negado');

  await prisma.course.delete({
    where: { id: courseId, tenantId }
  });

  // Não usamos revalidatePath, redirecionamos para a lista de cursos
  const { redirect } = await import('next/navigation');
  redirect('/admin/courses');
}
