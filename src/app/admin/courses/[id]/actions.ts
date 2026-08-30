'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(courseId: string, studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.create({
    data: { courseId, studentId }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function removeStudent(courseId: string, studentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.enrollment.delete({
    where: { studentId_courseId: { studentId, courseId } }
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function assignTeacher(courseId: string, teacherId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.courseTeacher.upsert({
    where: {
      teacherId_courseId: { teacherId, courseId }
    },
    update: {},
    create: { courseId, teacherId }
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/scanner');
}

export async function removeTeacher(courseId: string, teacherId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== 'ADMIN') throw new Error('Acesso negado');

  await prisma.courseTeacher.delete({
    where: {
      teacherId_courseId: { teacherId, courseId }
    }
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/scanner');
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;
  
  if (user?.user_metadata?.role !== 'ADMIN' || !tenantId) throw new Error('Acesso negado');

  await prisma.course.delete({
    where: { id: courseId, tenantId }
  });

  // Não usamos revalidatePath, redirecionamos para a lista de cursos
  const { redirect } = await import('next/navigation');
  redirect('/admin/courses');
}
