import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateDailyQrCode, getTodayDateString } from '@/lib/qr';
import { CheckCircle2, XCircle, Calendar, Sparkles, User, Mail } from 'lucide-react';
import styles from './student.module.css';
import QrGeneratorCard from './QrGeneratorCard';
import StudentRealtimeAttendance from './StudentRealtimeAttendance';
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
      }
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

        {/* Cartão de Geração de QR Code Interativo */}
        <QrGeneratorCard
          studentId={dbUser?.id || ''}
          courseName={course?.name}
          formattedDate={formattedDate}
          dailyQrValue={dailyQrValue}
        />

        {/* Resumo Acadêmico */}
        {course ? (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
                  Minha Turma
                </span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>
                  {course.name}
                </h2>
              </div>
              <div style={{ 
                background: attendanceRate >= 75 ? 'rgba(0, 217, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${attendanceRate >= 75 ? 'rgba(0, 217, 95, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                color: attendanceRate >= 75 ? 'var(--primary)' : '#f87171',
                padding: '6px 12px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {attendanceRate}% de Presença
              </div>
            </div>

            {/* Placar de 3 Contadores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'rgba(0,217,95,0.1)', padding: '14px 8px', borderRadius: '12px', border: '1px solid rgba(0,217,95,0.25)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{totalAttendances}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '6px', fontWeight: 600 }}>Presenças</div>
              </div>
              <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '14px 8px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)' }}>
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

        {/* Histórico Aula por Aula (Presença vs Falta) */}
        {sessions.length > 0 && (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Calendar size={18} color="var(--primary)" />
              Histórico Aula por Aula
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessions.map((session) => {
                const attendance = dbUser?.attendances.find(a => a.sessionId === session.id);
                const isPresent = !!attendance;
                const sessionDate = new Date(session.date);

                return (
                  <div
                    key={session.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.9rem 1.1rem',
                      borderRadius: '12px',
                      background: isPresent ? 'rgba(0, 217, 95, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${isPresent ? 'rgba(0, 217, 95, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderLeft: `4px solid ${isPresent ? 'var(--primary)' : 'var(--error)'}`
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>
                        {sessionDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} às {sessionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: isPresent ? 'rgba(0, 217, 95, 0.9)' : 'rgba(239, 68, 68, 0.9)', marginTop: '2px', display: 'block' }}>
                        {isPresent 
                          ? `Check-in realizado às ${new Date(attendance.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Ausente (Não compareceu)'
                        }
                      </span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isPresent ? 'rgba(0, 217, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isPresent ? 'var(--primary)' : 'var(--error)',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}>
                      {isPresent ? (
                        <>
                          <CheckCircle2 size={14} />
                          PRESENTE
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          FALTA
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dados Cadastrais */}
        <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#ffffff' }}>Meus Dados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>Nome Completo</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{dbUser?.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block' }}>E-mail</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{dbUser?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
