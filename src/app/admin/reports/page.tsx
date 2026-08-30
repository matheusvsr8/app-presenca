import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BarChart3, Users, Calendar, CheckCircle2, TrendingUp, AlertTriangle, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import ExportReportsButton from './ExportReportsButton';
import styles from '../students/students.module.css';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole !== 'ADMIN') redirect('/login');

  const tenantId = dbUser?.tenantId || user?.user_metadata?.tenantId;

  const courses = await prisma.course.findMany({
    where: { tenantId },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
        include: {
          attendances: true
        }
      },
      enrollments: {
        include: {
          student: {
            include: {
              attendances: true
            }
          }
        }
      }
    }
  });

  // Consolidação de dados para exportação e gráficos
  let totalGlobalSessions = 0;
  let totalGlobalAttendances = 0;
  let totalGlobalExpected = 0;

  const coursesData = courses.map(course => {
    const totalAttendances = course.sessions.reduce((acc, s) => acc + s.attendances.length, 0);
    const totalExpected = course.enrollments.length * course.sessions.length;
    const presenceRate = totalExpected > 0 ? Math.round((totalAttendances / totalExpected) * 100) : 0;

    totalGlobalSessions += course.sessions.length;
    totalGlobalAttendances += totalAttendances;
    totalGlobalExpected += totalExpected;

    return {
      id: course.id,
      name: course.name,
      enrolledStudentsCount: course.enrollments.length,
      totalSessionsCount: course.sessions.length,
      totalAttendancesCount: totalAttendances,
      presenceRate
    };
  });

  const globalPresenceRate = totalGlobalExpected > 0 
    ? Math.round((totalGlobalAttendances / totalGlobalExpected) * 100) 
    : 0;

  // Lista detalhada de alunos para a tabela e exportação
  const studentsData: Array<{
    name: string;
    email: string;
    courseName: string;
    totalSessions: number;
    attendancesCount: number;
    absencesCount: number;
    presenceRate: number;
    status: 'REGULAR' | 'ATENCAO' | 'EM_RISCO';
  }> = [];

  courses.forEach(course => {
    const courseSessionIds = course.sessions.map(s => s.id);
    const totalCourseSessions = courseSessionIds.length;

    course.enrollments.forEach(enrollment => {
      const student = enrollment.student;
      const studentAttendancesInCourse = student.attendances.filter(a => courseSessionIds.includes(a.sessionId)).length;
      const absences = Math.max(0, totalCourseSessions - studentAttendancesInCourse);
      const rate = totalCourseSessions > 0 ? Math.round((studentAttendancesInCourse / totalCourseSessions) * 100) : 100;

      let status: 'REGULAR' | 'ATENCAO' | 'EM_RISCO' = 'REGULAR';
      if (rate < 75) {
        status = 'EM_RISCO';
      } else if (rate < 85) {
        status = 'ATENCAO';
      }

      studentsData.push({
        name: student.name,
        email: student.email,
        courseName: course.name,
        totalSessions: totalCourseSessions,
        attendancesCount: studentAttendancesInCourse,
        absencesCount: absences,
        presenceRate: rate,
        status
      });
    });
  });

  const atRiskStudents = studentsData.filter(s => s.status === 'EM_RISCO');

  return (
    <div className={styles.container} style={{ paddingBottom: '6rem' }}>
      <header className={styles.header} style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
            <Sparkles size={13} />
            Métricas e Desempenho
          </div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <BarChart3 size={28} color="var(--primary)" />
            Relatórios de Frequência
          </h1>
          <p className={styles.subtitle} style={{ margin: '4px 0 0 0' }}>
            Assiduidade, estatísticas visuais e alertas de risco por turma.
          </p>
        </div>

        {/* Botões de Exportação CSV e Impressão PDF */}
        <ExportReportsButton
          coursesData={coursesData}
          studentsData={studentsData}
        />
      </header>

      {courses.length === 0 ? (
        <div className={styles.emptyState}>Nenhuma turma encontrada.</div>
      ) : (
        <>
          {/* Card de Resumo Global & Gráfico Visual */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            {/* Anel de Assiduidade Global */}
            <div className="glass" style={{
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(0, 217, 95, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  Frequência Geral
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                  {globalPresenceRate}%
                </h2>
                <span style={{ fontSize: '0.78rem', color: globalPresenceRate >= 75 ? 'var(--primary)' : 'var(--error)', fontWeight: 700 }}>
                  {totalGlobalAttendances} presenças em {totalGlobalExpected} chamadas esperadas
                </span>
              </div>

              {/* Mini gráfico SVG circular */}
              <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeDasharray={`${globalPresenceRate}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                  {globalPresenceRate}%
                </div>
              </div>
            </div>

            {/* Card de Alerta de Alunos em Risco (<75%) */}
            <div className="glass" style={{
              padding: '1.5rem',
              borderRadius: '20px',
              border: atRiskStudents.length > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: atRiskStudents.length > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: atRiskStudents.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 217, 95, 0.15)',
                color: atRiskStudents.length > 0 ? 'var(--error)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {atRiskStudents.length > 0 ? <ShieldAlert size={26} /> : <CheckCircle2 size={26} />}
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  Alunos em Risco (&lt;75%)
                </span>
                <h3 style={{ margin: '2px 0', fontSize: '1.5rem', fontWeight: 800, color: atRiskStudents.length > 0 ? '#fca5a5' : '#ffffff' }}>
                  {atRiskStudents.length} {atRiskStudents.length === 1 ? 'aluno' : 'alunos'}
                </h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {atRiskStudents.length > 0 ? 'Necessitam de atenção para não reprovar por falta' : 'Nenhum aluno em risco crítico no momento'}
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico Visual de Barras por Turma */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Comparativo de Frequência por Turma
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {coursesData.map(course => (
                <div key={course.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{course.name}</span>
                    <span style={{ fontWeight: 800, color: course.presenceRate >= 75 ? 'var(--primary)' : 'var(--error)' }}>
                      {course.presenceRate}% ({course.totalAttendancesCount} presenças)
                    </span>
                  </div>
                  {/* Barra de Progresso */}
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${course.presenceRate}%`,
                      height: '100%',
                      background: course.presenceRate >= 85 
                        ? 'linear-gradient(90deg, #00d95f, #00ffff)' 
                        : course.presenceRate >= 75 
                          ? '#00d95f' 
                          : '#ef4444',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção Detalhada Aluno por Aluno */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" />
              Desempenho Individual dos Alunos
            </h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Total: {studentsData.length} matrículas
            </span>
          </div>

          {/* Tabela para Desktop */}
          <div className={styles.desktopTable}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Aulas</th>
                    <th>Presenças</th>
                    <th>Faltas</th>
                    <th>Frequência</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student, idx) => (
                    <tr key={`${student.email}-${idx}`}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.55 }}>{student.email}</div>
                      </td>
                      <td>{student.courseName}</td>
                      <td>{student.totalSessions}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{student.attendancesCount}</td>
                      <td style={{ color: student.absencesCount > 0 ? 'var(--error)' : 'inherit', fontWeight: 700 }}>{student.absencesCount}</td>
                      <td style={{ fontWeight: 800 }}>{student.presenceRate}%</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: student.status === 'EM_RISCO' 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : student.status === 'ATENCAO' 
                              ? 'rgba(234, 179, 8, 0.2)' 
                              : 'rgba(0, 217, 95, 0.15)',
                          color: student.status === 'EM_RISCO' 
                            ? '#fca5a5' 
                            : student.status === 'ATENCAO' 
                              ? '#fde047' 
                              : 'var(--primary)',
                          border: `1px solid ${student.status === 'EM_RISCO' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'}`
                        }}>
                          {student.status === 'EM_RISCO' ? '⚠️ EM RISCO' : student.status === 'ATENCAO' ? '🟡 ATENÇÃO' : '🟢 REGULAR'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards para Mobile (Sem rolagem lateral) */}
          <div className={styles.mobileCards}>
            {studentsData.map((student, idx) => (
              <div key={`m-${student.email}-${idx}`} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{student.name}</h3>
                    <p className={styles.cardSubtitle}>{student.courseName}</p>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: student.status === 'EM_RISCO' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 217, 95, 0.15)',
                    color: student.status === 'EM_RISCO' ? '#fca5a5' : 'var(--primary)'
                  }}>
                    {student.presenceRate}%
                  </span>
                </div>

                <div className={styles.cardStatsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Aulas</span>
                    <span className={styles.statValue}>{student.totalSessions}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Presenças</span>
                    <span className={styles.statValue} style={{ color: 'var(--primary)' }}>{student.attendancesCount}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Faltas</span>
                    <span className={styles.statValue} style={{ color: student.absencesCount > 0 ? 'var(--error)' : 'inherit' }}>
                      {student.absencesCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
