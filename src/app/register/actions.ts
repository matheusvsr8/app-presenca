'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function registerStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const courseId = formData.get('courseId') as string;

  if (!name || !email || !password || !courseId) {
    throw new Error('Preencha todos os campos obrigatórios.');
  }

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('E-mail já está em uso.');
  }

  // Buscar o curso para pegar o tenantId
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error('Curso não encontrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const qrCode = crypto.randomUUID();

  // Executar criação do aluno e matrícula numa transação segura
  await prisma.$transaction(async (tx) => {
    const student = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        qrCode,
        tenantId: course.tenantId
      }
    });

    await tx.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id
      }
    });
  });

  return { success: true };
}
