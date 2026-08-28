import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from '../students/students.module.css'; // Reusing students styles

export default async function CoursesPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) return null;

  const courses = await prisma.course.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { enrollments: true, sessions: true }
      }
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Cursos & Turmas</h1>
          <p className={styles.subtitle}>Gerencie os cursos e as matrículas da sua instituição.</p>
        </div>
        <Link href="/admin/courses/new" className={styles.primaryButton}>
          + Novo Curso
        </Link>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome do Curso</th>
              <th>Alunos Matriculados</th>
              <th>Aulas (Sessões)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Nenhum curso cadastrado.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td style={{ fontWeight: 500 }}>{course.name}</td>
                  <td>{course._count.enrollments} alunos</td>
                  <td>{course._count.sessions} aulas</td>
                  <td>
                    <Link href={`/admin/courses/${course.id}`} className={styles.linkButton}>
                      Gerenciar Matrículas
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
