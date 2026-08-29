'use server';

import { prisma } from '@/lib/prisma';

export async function checkStudentLatestAttendance(studentId: string, knownAttendanceCount: number) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        session: {
          include: {
            course: true
          }
        }
      }
    });

    const totalCount = await prisma.attendance.count({
      where: { studentId }
    });

    if (totalCount > knownAttendanceCount && attendances.length > 0) {
      const latest = attendances[0];
      return {
        hasNew: true,
        totalCount,
        courseName: latest.session.course.name,
        date: new Date(latest.session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: new Date(latest.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    }

    return { hasNew: false, totalCount };
  } catch (error) {
    return { hasNew: false, totalCount: knownAttendanceCount };
  }
}
