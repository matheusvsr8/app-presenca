import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './student.module.css';
import { QRCodeSVG } from 'qrcode.react';

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
              sessions: true
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

  const enrollment = dbUser?.enrollments[0]; // Assumindo que o aluno tem 1 matrícula por vez
  const course = enrollment?.course;
  
  // Calculando as métricas
  const totalSessions = course?.sessions.length || 0;
  const totalAttendances = dbUser?.attendances.filter(a => a.session.courseId === course?.id).length || 0;
  const totalAbsences = Math.max(0, totalSessions - totalAttendances); // Faltas são as sessões que ocorreram menos as que ele foi

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className={styles.title} style={{ margin: 0 }}>Olá, {dbUser?.name?.split(' ')[0]}</h1>
          <a href="/api/auth/signout" style={{ color: 'var(--error)', fontWeight: 'bold', textDecoration: 'none' }}>Sair</a>
        </div>
        <p className={styles.subtitle}>Área do Aluno</p>
      </header>

      <main className={styles.main}>
        {/* Cartão de Identificação (QR) */}
        <div className={`${styles.card} glass`}>
          <h2>Seu QR Code de Acesso</h2>
          <div className={styles.qrPlaceholder}>
            {dbUser?.qrCode ? (
              <QRCodeSVG value={dbUser.qrCode} size={180} fgColor="var(--primary)" bgColor="transparent" />
            ) : (
              <p>Você não possui um QR Code ainda.</p>
            )}
          </div>
          <p className={styles.instructions} style={{ marginBottom: 0 }}>Apresente este código ao chegar na aula.</p>
        </div>

        {/* Resumo Acadêmico */}
        {course ? (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Meu Curso</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, marginBottom: '1.5rem' }}>{course.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'rgba(0,255,136,0.1)', padding: '15px 10px', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.3)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{totalAttendances}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Presenças</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,85,85,0.1)', padding: '15px 10px', borderRadius: '12px', border: '1px solid rgba(255,85,85,0.3)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--error)' }}>{totalAbsences}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Faltas</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalSessions}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Aulas Totais</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, opacity: 0.7 }}>Você não está matriculado em nenhum curso no momento.</p>
          </div>
        )}

        {/* Dados do Usuário */}
        <div className={`${styles.card} glass`} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Meus Dados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block' }}>Nome Completo</span>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>{dbUser?.name}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block' }}>E-mail</span>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>{dbUser?.email}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
