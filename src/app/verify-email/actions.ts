'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function verifyEmailAction(email: string, token: string) {
  if (!email || !token) {
    throw new Error('E-mail e código são obrigatórios.');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup' // O tipo de token que o Supabase envia no cadastro
  });

  if (error) {
    throw new Error('Código inválido ou expirado.');
  }

  // Se o token estiver certo, o usuário agora está logado no Supabase.
  // Precisamos sincronizar esse usuário com a nossa tabela do Prisma.
  if (data.user) {
    const { id, user_metadata } = data.user;
    
    try {
      // Verifica se já existe no Prisma para não duplicar
      const existingUser = await prisma.user.findUnique({ where: { id } });
      
      if (!existingUser && user_metadata?.role === 'STUDENT') {
        await prisma.$transaction(async (tx) => {
          const student = await tx.user.create({
            data: {
              id,
              name: user_metadata.name || 'Sem nome',
              email: email,
              role: 'STUDENT',
              qrCode: user_metadata.qrCode || id,
              tenantId: user_metadata.tenantId,
            }
          });

          await tx.enrollment.create({
            data: {
              studentId: student.id,
              courseId: user_metadata.courseId
            }
          });
        });
      }
    } catch (prismaError: any) {
      console.error("ERRO DO PRISMA:", prismaError);
      throw new Error("Erro de Banco de Dados: " + (prismaError.message || JSON.stringify(prismaError)));
    }
  }

  return { success: true };
}
