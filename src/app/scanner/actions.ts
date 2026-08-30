'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { verifyDailyQrCode } from '@/lib/qr';
import { revalidatePath } from 'next/cache';

export async function createClassSession(courseId: string, dateString: string, timeString?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user?.user_metadata?.role === 'STUDENT') {
    return { success: false, error: 'Não autorizado.' };
  }

  try {
    let sessionDate = new Date();
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      sessionDate.setFullYear(year, month - 1, day);
    }
    
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        sessionDate.setHours(hours, minutes, 0, 0);
      }
    }

    const newSession = await prisma.session.create({
      data: {
        courseId,
        date: sessionDate,
      },
    });

    revalidatePath(`/scanner/${courseId}`);
    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error('Erro ao criar sessão de aula:', error);
    return { success: false, error: 'Erro ao criar sessão de aula.' };
  }
}

export async function toggleManualAttendance(sessionId: string, studentId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user?.user_metadata?.role === 'STUDENT') {
    return { success: false, error: 'Não autorizado.' };
  }

  try {
    const existing = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });

    if (existing) {
      await prisma.attendance.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/scanner/${courseId}`);
      return { success: true, isPresent: false, message: 'Presença removida.' };
    } else {
      await prisma.attendance.create({
        data: {
          sessionId,
          studentId,
        },
      });
      revalidatePath(`/scanner/${courseId}`);
      return { success: true, isPresent: true, message: 'Presença marcada manualmente!' };
    }
  } catch (error) {
    console.error('Erro ao alternar presença manual:', error);
    return { success: false, error: 'Erro ao atualizar presença.' };
  }
}

export async function registerAttendance(qrCode: string, sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user?.user_metadata?.role === 'STUDENT') {
    return { success: false, error: 'Não autorizado.' };
  }

  const tenantId = user?.user_metadata?.tenantId;

  try {
    // 1. Validação Criptográfica e Temporal do QR Code Diário
    const verification = verifyDailyQrCode(qrCode);
    if (!verification.isValid) {
      return { success: false, error: verification.error || 'QR Code inválido ou expirado.' };
    }

    // 2. Achar o aluno no banco de dados
    let student = null;
    if (qrCode.startsWith('LOGQR:')) {
      student = await prisma.user.findFirst({
        where: { id: verification.studentId, tenantId },
      });
    } else {
      student = await prisma.user.findFirst({
        where: { qrCode: verification.studentId, tenantId },
      });
    }

    if (!student) {
      return { success: false, error: 'Aluno não encontrado ou não pertence a esta instituição.' };
    }

    // 2. Achar a sessão e o curso correspondente
    const classSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!classSession || classSession.course.tenantId !== tenantId) {
      return { success: false, error: 'Sessão inválida.' };
    }

    // 3. Checar se o aluno está matriculado no curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: classSession.courseId,
        },
      },
    });

    if (!enrollment) {
      return { success: false, error: 'O aluno não está matriculado neste curso.' };
    }

    // 4. Registrar presença (se já existir, vai ignorar ou dar erro, por isso usamos upsert)
    await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        sessionId,
        studentId: student.id,
      },
    });

    return { 
      success: true, 
      studentName: student.name,
      message: `Presença registrada para ${student.name}!` 
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Erro interno ao registrar presença.' };
  }
}
