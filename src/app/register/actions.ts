'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function registerStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const courseId = formData.get('courseId') as string;

  if (!name || !email || !password || !courseId) {
    return { error: 'Preencha todos os campos obrigatórios.' };
  }

  // Buscar o curso para pegar o tenantId antes de cadastrar
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return { error: 'Curso não encontrado.' };
  }

  const supabase = await createClient();

  // O Supabase enviará o e-mail automaticamente de acordo com as configurações do painel
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'STUDENT',
        courseId,
        tenantId: course.tenantId,
        qrCode: crypto.randomUUID()
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Retornamos o email para que a UI direcione para /verify-email
  return { success: true, email };
}
