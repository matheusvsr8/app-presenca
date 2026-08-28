'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function createStudent(formData: FormData) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user || session.user.role !== 'ADMIN' || !tenantId) {
    throw new Error('Acesso negado');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // Hash simples padrão para todos (idealmente enviaria e-mail de definição)
  const password = await bcryptjs.hash('123456', 10);
  
  // Gerar um código único para o QRCode
  const qrCode = `qr-${tenantId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: 'STUDENT',
      qrCode,
      tenantId,
    },
  });

  redirect('/admin/students');
}
