import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';
import styles from '../students/students.module.css';

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

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

      {courses.length === 0 ? (
        <div className={styles.emptyState}>Nenhum curso cadastrado.</div>
      ) : (
        <>
          {/* Tabela para Desktop */}
          <div className={styles.desktopTable}>
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
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td style={{ fontWeight: 600 }}>{course.name}</td>
                      <td>{course._count.enrollments} alunos</td>
                      <td>{course._count.sessions} aulas</td>
                      <td>
                        <Link href={`/admin/courses/${course.id}`} className={styles.linkButton}>
                          Gerenciar Matrículas &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards para Mobile (Sem rolagem lateral) */}
          <div className={styles.mobileCards}>
            {courses.map((course) => (
              <div key={course.id} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(0, 217, 95, 0.1)',
                      border: '1px solid rgba(0, 217, 95, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{course.name}</h3>
                      <p className={styles.cardSubtitle}>Turma Ativa</p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardStatsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>
                      <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Matriculados
                    </span>
                    <span className={styles.statValue}>{course._count.enrollments} alunos</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Aulas
                    </span>
                    <span className={styles.statValue}>{course._count.sessions} sessões</span>
                  </div>
                </div>

                <div className={styles.cardAction}>
                  <Link href={`/admin/courses/${course.id}`} className={styles.cardButton}>
                    Gerenciar Matrículas <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
