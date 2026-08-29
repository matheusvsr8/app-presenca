import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScannerClient from '../ScannerClient';
import SessionManagerModal from './SessionManagerModal';
import ClassAttendanceList from './ClassAttendanceList';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default async function ScannerCoursePage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ courseId: string }> | { courseId: string };
  searchParams?: Promise<{ sessionId?: string }> | { sessionId?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole === 'STUDENT') {
    redirect('/student');
  }

  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const courseId = resolvedParams.courseId;
  const requestedSessionId = resolvedSearchParams.sessionId;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
        include: {
          attendances: {
            include: {
              student: true
            }
          }
        }
      },
      enrollments: {
        include: {
          student: true
        }
      }
    }
  });

  if (!course) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <h2>Turma não encontrada.</h2>
        <Link href="/scanner" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>
          &larr; Voltar para lista de turmas
        </Link>
      </div>
    );
  }

  let classSessions = course.sessions;

  // Se não existir nenhuma sessão para o curso, cria uma inicial automaticamente
  if (classSessions.length === 0) {
    const newSession = await prisma.session.create({
      data: {
        courseId: course.id,
        date: new Date()
      },
      include: {
        attendances: {
          include: {
            student: true
          }
        }
      }
    });
    classSessions = [newSession];
  }

  // Determina a sessão ativa selecionada
  let activeSession = requestedSessionId 
    ? classSessions.find(s => s.id === requestedSessionId) || classSessions[0]
    : classSessions[0];

  const formattedSessions = classSessions.map(s => ({
    id: s.id,
    date: s.date.toISOString(),
    attendanceCount: s.attendances.length
  }));

  // Monta a lista completa de alunos matriculados com status Presente vs Falta para esta sessão
  const studentsAttendanceStatus = course.enrollments.map(enrollment => {
    const student = enrollment.student;
    const attendance = activeSession.attendances.find(a => a.studentId === student.id);
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      isPresent: !!attendance,
      checkedInAt: attendance ? new Date(attendance.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined
    };
  }).sort((a, b) => {
    // Presentes primeiro, depois por ordem alfabética
    if (a.isPresent && !b.isPresent) return -1;
    if (!a.isPresent && b.isPresent) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ padding: '1.25rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingBottom: '6rem' }}>
      {/* Topo com Logo e Trocar Turma */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <Logo size={32} />

        <Link href="/scanner" style={{ 
          color: 'rgba(255,255,255,0.8)', 
          textDecoration: 'none', 
          fontSize: '0.85rem',
          fontWeight: 700,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.4rem 0.85rem', 
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          &larr; Trocar Turma
        </Link>
      </header>

      {/* Gestor e Seletor de Sessões com Data e Horário */}
      <SessionManagerModal
        courseId={course.id}
        courseName={course.name}
        activeSessionId={activeSession.id}
        sessions={formattedSessions}
      />

      {/* Leitor de Câmera Traseira Direta */}
      <ScannerClient sessionId={activeSession.id} />

      {/* Lista de Chamada em Tempo Real: Presenças vs Faltas da Turma */}
      <ClassAttendanceList
        students={studentsAttendanceStatus}
        sessionDate={activeSession.date.toISOString()}
      />
    </div>
  );
}
