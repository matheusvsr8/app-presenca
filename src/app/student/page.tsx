import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateDailyQrCode, getTodayDateString } from '@/lib/qr';
import { CheckCircle2, XCircle, Calendar, Sparkles, User, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';
import styles from './student.module.css';
import QrGeneratorCard from './QrGeneratorCard';
import StudentRealtimeAttendance from './StudentRealtimeAttendance';
import StudentTimelineList from './StudentTimelineList';
import Logo from '@/components/Logo';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              sessions: {
                orderBy: { date: 'desc' }
              }
            }
          }
        }
      },
      attendances: {
        include: {
          session: true
        }
      },
      absenceExcuses: true
    }
  });

  // Se o usuário foi promovido no banco, redireciona em tempo real!
  if (dbUser?.role === 'COLLABORATOR') {
    redirect('/scanner');
  } else if (dbUser?.role === 'ADMIN') {
    redirect('/admin');
  }

  const enrollment = dbUser?.enrollments[0];
  const course = enrollment?.course;
  const sessions = course?.sessions || [];
  
  // Calculando as métricas
  const totalSessions = sessions.length;
  const totalAttendances = dbUser?.attendances.filter(a => a.session.courseId === course?.id).length || 0;
  const totalAbsences = Math.max(0, totalSessions - totalAttendances);
  const attendanceRate = totalSessions > 0 ? Math.round((totalAttendances / totalSessions) * 100) : 0;

  // QR Code Dinâmico Diário
  const todayStr = getTodayDateString();
  const formattedDate = todayStr.split('-').reverse().join('/');
  const dailyQrValue = dbUser ? generateDailyQrCode(dbUser.id, todayStr) : '';

  const isAtRisk = totalSessions > 0 && attendanceRate < 75;

  const formattedSessions = sessions.map(s => ({
    id: s.id,
    date: s.date.toISOString(),
  }));

  const formattedAttendances = (dbUser?.attendances || []).map(a => ({
    sessionId: a.sessionId,
    createdAt: a.createdAt.toISOString(),
  }));

  const formattedExcuses = (dbUser?.absenceExcuses || []).map(e => ({
    id: e.id,
    sessionId: e.sessionId,
    reason: e.reason,
    documentUrl: e.documentUrl,
    status: e.status,
    feedback: e.feedback,
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Logo size={32} />
          <a href="/api/auth/signout" style={{ 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.25)', 
            padding: '0.4rem 0.85rem', 
            borderRadius: '9999px', 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            textDecoration: 'none' 
          }}>
            Sair
          </a>
        </div>

        <div>
          <h1 className={styles.title} style={{ margin: 0, fontSize: '1.75rem' }}>
            Olá, {dbUser?.name?.split(' ')[0]} 👋
          </h1>
          <p className={styles.subtitle}>Acompanhe sua frequência e gere seu código de aula</p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Notificador de Presença em Tempo Real com Som e Modal */}
        {dbUser && (
          <StudentRealtimeAttendance
            studentId={dbUser.id}
            initialAttendanceCount={dbUser.attendances.length}
          />
        )}

        {/* Alerta de Frequência Baixa (< 75%) */}
        {isAtRisk && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: '#fca5a5' }}>
                Atenção: Frequência Abaixo de 75%
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
                Sua taxa atual é de <strong>{attendanceRate}%</strong>. Justifique suas faltas com atestado ou compareça às próximas aulas para não correr risco de reprovação.
              </p>
            </div>
          </div>
        )}

        {/* Cartão de Geração de QR Code Interativo */}
        <QrGeneratorCard
          studentId={dbUser?.id || ''}
          courseName={course?.name}
          formattedDate={formattedDate}
          dailyQrValue={dailyQrValue}
        />

        {/* Informações da Matrícula e Frequência */}
        {course ? (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Turma Atual</span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>{course.name}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Frequência</span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  color: attendanceRate >= 75 ? 'var(--primary)' : 'var(--error)' 
                }}>
                  {attendanceRate}%
                </span>
              </div>
            </div>

            {/* Grid com Contadores de Presença e Falta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'rgba(0, 217, 95, 0.08)', padding: '14px 8px', borderRadius: '12px', border: '1px solid rgba(0, 217, 95, 0.2)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{totalAttendances}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '6px', fontWeight: 600 }}>Presenças</div>
              </div>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px 8px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--error)', lineHeight: 1 }}>{totalAbsences}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '6px', fontWeight: 600 }}>Faltas</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{totalSessions}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '6px', fontWeight: 600 }}>Aulas Totais</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, opacity: 0.7 }}>Você não está matriculado em nenhuma turma no momento.</p>
          </div>
        )}

        {/* Histórico Aula por Aula com Justificativas */}
        {sessions.length > 0 && (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Calendar size={18} color="var(--primary)" />
              Histórico Aula por Aula
            </h2>

            <StudentTimelineList
              sessions={formattedSessions}
              attendances={formattedAttendances}
              excuses={formattedExcuses}
              courseName={course?.name || 'Turma'}
            />
          </div>
        )}

        {/* Dados Cadastrais */}
        <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1rem', opacity: 0.8 }}>Dados Cadastrais</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.75 }}>
              <User size={15} color="var(--primary)" />
              <span>{dbUser?.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.75 }}>
              <Mail size={15} color="var(--primary)" />
              <span>{dbUser?.email}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
