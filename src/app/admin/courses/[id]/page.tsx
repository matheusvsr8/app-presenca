import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from '../../students/students.module.css';
import EnrollmentManager from './EnrollmentManager';
import { deleteCourse } from './actions';

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId || session?.user?.role !== 'ADMIN') redirect('/login');

  const course = await prisma.course.findFirst({
    where: { id: params.id, tenantId },
    include: { enrollments: true }
  });

  if (!course) return <div>Curso não encontrado.</div>;

  // Buscar todos os alunos do tenant
  const allStudents = await prisma.user.findMany({
    where: { tenantId, role: 'STUDENT' },
    orderBy: { name: 'asc' }
  });

  const enrolledIds = course.enrollments.map(e => e.studentId);
  
  const enrolledStudents = allStudents.filter(s => enrolledIds.includes(s.id));
  const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{course.name}</h1>
          <p className={styles.subtitle}>Gerencie os alunos vinculados a esta turma.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <form action={async () => {
            'use server';
            await deleteCourse(course.id);
          }}>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
              Excluir Curso
            </button>
          </form>
          <Link href="/admin/courses" className={styles.linkButton} style={{ display: 'flex', alignItems: 'center' }}>
            Voltar
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Matriculados ({enrolledStudents.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {enrolledStudents.length === 0 ? <li style={{ opacity: 0.5 }}>Nenhum aluno.</li> : null}
            {enrolledStudents.map(student => (
              <li key={student.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{student.name}</span>
                <EnrollmentManager courseId={course.id} studentId={student.id} isEnrolled={true} />
              </li>
            ))}
          </ul>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Disponíveis ({availableStudents.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {availableStudents.length === 0 ? <li style={{ opacity: 0.5 }}>Todos já matriculados.</li> : null}
            {availableStudents.map(student => (
              <li key={student.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{student.name}</span>
                <EnrollmentManager courseId={course.id} studentId={student.id} isEnrolled={false} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
