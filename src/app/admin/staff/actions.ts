'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function getStaff() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  return await prisma.user.findMany({
    where: { 
      tenantId: session.user.tenantId,
      role: {
        in: ['ADMIN', 'COLLABORATOR']
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createStaffUser(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !password || !role) {
    throw new Error('Preencha todos os campos');
  }

  // Verifica se email ja existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('E-mail já está em uso.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role, // ADMIN ou COLLABORATOR
      tenantId: session.user.tenantId
    }
  });

  revalidatePath('/admin/staff');
}

export async function deleteStaffUser(id: string) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  // Impede que o admin exclua a si mesmo
  if (id === session.user.id) {
    throw new Error('Você não pode excluir sua própria conta.');
  }

  await prisma.user.delete({
    where: { 
      id,
      tenantId: session.user.tenantId
    }
  });

  revalidatePath('/admin/staff');
}
