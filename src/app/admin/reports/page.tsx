import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import styles from '../students/students.module.css';

export default async function ReportsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.tenantId;

  if (!tenantId || user?.role !== 'ADMIN') redirect('/login');

  // Relatório simples: lista cursos e puxa dados agregados
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
          <h1 className={styles.title}>Relatórios de Frequência</h1>
          <p className={styles.subtitle}>Visão geral de assiduidade por turma.</p>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Turma</th>
              <th>Alunos Matriculados</th>
              <th>Total de Aulas</th>
              <th>Presenças Registradas</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Nenhuma turma encontrada.</td>
              </tr>
            ) : (
              courses.map(course => {
                const totalAttendances = course.sessions.reduce((acc, session) => acc + session.attendances.length, 0);
                return (
                  <tr key={course.id}>
                    <td style={{ fontWeight: 500 }}>{course.name}</td>
                    <td>{course.enrollments.length}</td>
                    <td>{course.sessions.length}</td>
                    <td>{totalAttendances}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
