'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(courseId: string, studentId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.create({
    data: { courseId, studentId }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function removeStudent(courseId: string, studentId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.delete({
    where: { studentId_courseId: { studentId, courseId } }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  
  if (session?.user?.role !== 'ADMIN' || !tenantId) throw new Error('Acesso negado');

  await prisma.course.delete({
    where: { id: courseId, tenantId }
  });

  // Não usamos revalidatePath, redirecionamos para a lista de cursos
  const { redirect } = await import('next/navigation');
  redirect('/admin/courses');
}
