'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitAbsenceExcuse(sessionId: string, reason: string, documentBase64?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'Por favor, detalhe o motivo da justificativa (mínimo 5 caracteres).' };
  }

  try {
    await prisma.absenceExcuse.upsert({
      where: {
        studentId_sessionId: {
          studentId: user.id,
          sessionId,
        },
      },
      update: {
        reason,
        documentUrl: documentBase64 || null,
        status: 'PENDING',
        feedback: null,
      },
      create: {
        studentId: user.id,
        sessionId,
        reason,
        documentUrl: documentBase64 || null,
        status: 'PENDING',
      },
    });

    revalidatePath('/student');
    revalidatePath('/admin/excuses');
    return { success: true, message: 'Justificativa enviada para análise com sucesso!' };
  } catch (error) {
    console.error('Erro ao enviar justificativa:', error);
    return { success: false, error: 'Erro interno ao salvar justificativa.' };
  }
}

export async function reviewAbsenceExcuse(excuseId: string, status: 'APPROVED' | 'REJECTED', feedback?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user?.user_metadata?.role === 'STUDENT') {
    return { success: false, error: 'Não autorizado.' };
  }

  try {
    const excuse = await prisma.absenceExcuse.findUnique({
      where: { id: excuseId },
      include: { student: true, session: true },
    });

    if (!excuse) {
      return { success: false, error: 'Justificativa não encontrada.' };
    }

    // Atualiza a justificativa
    await prisma.absenceExcuse.update({
      where: { id: excuseId },
      data: {
        status,
        feedback: feedback || null,
        reviewedBy: user.email || user.id,
      },
    });

    // Se foi aprovado, abona a falta criando o registro de presença na sessão
    if (status === 'APPROVED') {
      await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: excuse.sessionId,
            studentId: excuse.studentId,
          },
        },
        update: {},
        create: {
          sessionId: excuse.sessionId,
          studentId: excuse.studentId,
        },
      });
    }

    revalidatePath('/admin/excuses');
    revalidatePath('/student');
    revalidatePath(`/scanner/${excuse.session.courseId}`);
    return { success: true, message: status === 'APPROVED' ? 'Atestado aprovado e falta abonada!' : 'Justificativa rejeitada.' };
  } catch (error) {
    console.error('Erro ao revisar justificativa:', error);
    return { success: false, error: 'Erro ao processar justificativa.' };
  }
}
