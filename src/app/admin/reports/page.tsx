import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BarChart3, Users, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import styles from '../students/students.module.css';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

  if (!tenantId || user?.user_metadata?.role !== 'ADMIN') redirect('/login');

  const courses = await prisma.course.findMany({
    where: { tenantId },
    include: {
      sessions: {
        include: {
          attendances: true
        }
      },
      enrollments: true
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={30} />
            Relatórios de Frequência
          </h1>
          <p className={styles.subtitle}>Visão geral de assiduidade por turma.</p>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className={styles.emptyState}>Nenhuma turma encontrada.</div>
      ) : (
        <>
          {/* Tabela para Desktop */}
          <div className={styles.desktopTable}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Turma</th>
                    <th>Alunos Matriculados</th>
                    <th>Total de Aulas</th>
                    <th>Presenças Registradas</th>
                    <th>Taxa de Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const totalAttendances = course.sessions.reduce((acc, s) => acc + s.attendances.length, 0);
                    const totalExpected = course.enrollments.length * course.sessions.length;
                    const presenceRate = totalExpected > 0 ? Math.round((totalAttendances / totalExpected) * 100) : 0;

                    return (
                      <tr key={course.id}>
                        <td style={{ fontWeight: 600 }}>{course.name}</td>
                        <td>{course.enrollments.length} alunos</td>
                        <td>{course.sessions.length} aulas</td>
                        <td>{totalAttendances} presenças</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            background: presenceRate >= 75 ? 'rgba(0, 217, 95, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: presenceRate >= 75 ? 'var(--primary)' : '#f87171',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            {presenceRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards para Mobile (Sem rolagem lateral) */}
          <div className={styles.mobileCards}>
            {courses.map((course) => {
              const totalAttendances = course.sessions.reduce((acc, s) => acc + s.attendances.length, 0);
              const totalExpected = course.enrollments.length * course.sessions.length;
              const presenceRate = totalExpected > 0 ? Math.round((totalAttendances / totalExpected) * 100) : 0;

              return (
                <div key={course.id} className={styles.cardItem}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>{course.name}</h3>
                      <p className={styles.cardSubtitle}>Métricas da Turma</p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      background: presenceRate >= 75 ? 'rgba(0, 217, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: presenceRate >= 75 ? 'var(--primary)' : '#f87171',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <TrendingUp size={14} />
                      {presenceRate}%
                    </span>
                  </div>

                  <div className={styles.cardStatsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>
                        <Users size={11} style={{ display: 'inline', marginRight: '2px' }} />
                        Alunos
                      </span>
                      <span className={styles.statValue}>{course.enrollments.length}</span>
                    </div>

                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>
                        <Calendar size={11} style={{ display: 'inline', marginRight: '2px' }} />
                        Aulas
                      </span>
                      <span className={styles.statValue}>{course.sessions.length}</span>
                    </div>

                    <div className={styles.statBox}>
                      <span className={styles.statLabel}>
                        <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '2px' }} />
                        Presenças
                      </span>
                      <span className={styles.statValue} style={{ color: 'var(--primary)' }}>
                        {totalAttendances}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
