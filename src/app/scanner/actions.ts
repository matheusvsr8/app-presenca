'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function registerAttendance(qrCode: string, sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user?.user_metadata?.role === 'STUDENT') {
    return { success: false, error: 'Não autorizado.' };
  }

  const tenantId = user?.user_metadata?.tenantId;

  try {
    // 1. Achar o aluno pelo QRCode e checar tenant
    const student = await prisma.user.findUnique({
      where: { qrCode, tenantId },
    });

    if (!student) {
      return { success: false, error: 'Aluno não encontrado ou não pertence a esta empresa.' };
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
      message: `Presença registrada para ${student.name}!` 
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Erro interno ao registrar presença.' };
  }
}
