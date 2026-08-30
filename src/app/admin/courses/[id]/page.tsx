import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from '../../students/students.module.css';
import EnrollmentManager from './EnrollmentManager';
import TeacherManager from './TeacherManager';
import { deleteCourse } from './actions';
import { BookOpen, UserCog, Users, Trash2, ArrowLeft } from 'lucide-react';

export default async function CourseDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole !== 'ADMIN') redirect('/login');

  const tenantId = dbUser?.tenantId || user?.user_metadata?.tenantId;

  const resolvedParams = await Promise.resolve(params);
  const course = await prisma.course.findFirst({
    where: { id: resolvedParams.id, tenantId },
    include: { 
      enrollments: true,
      teachers: true
    }
  });

  if (!course) return <div className={styles.container}>Curso não encontrado.</div>;

  // Buscar todos os alunos e colaboradores do tenant
  const [allStudents, allCollaborators] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId, role: 'STUDENT' },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: { tenantId, role: { in: ['COLLABORATOR', 'ADMIN'] } },
      orderBy: { name: 'asc' }
    })
  ]);

  // Alunos matriculados e disponíveis
  const enrolledIds = course.enrollments.map(e => e.studentId);
  const enrolledStudents = allStudents.filter(s => enrolledIds.includes(s.id));
  const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id));

  // Professores vinculados e disponíveis
  const assignedTeacherIds = course.teachers.map(t => t.teacherId);
  const assignedTeachers = allCollaborators.filter(c => assignedTeacherIds.includes(c.id));
  const availableTeachers = allCollaborators.filter(c => !assignedTeacherIds.includes(c.id));

  return (
    <div className={styles.container} style={{ paddingBottom: '6rem' }}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={26} color="var(--primary)" />
            {course.name}
          </h1>
          <p className={styles.subtitle}>Gerencie os professores responsáveis e os alunos desta turma.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form action={async () => {
            'use server';
            await deleteCourse(course.id);
          }}>
            <button type="submit" style={{ padding: '0.65rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={15} />
              Excluir Curso
            </button>
          </form>
          <Link href="/admin/courses" className={styles.linkButton} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </header>

      {/* SEÇÃO 1: PROFESSORES / COLABORADORES RESPONSÁVEIS */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCog size={20} color="var(--primary)" />
          Professores Responsáveis pela Turma
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Professores Vinculados */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 217, 95, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem', fontWeight: 800 }}>
                Professores Atribuídos ({assignedTeachers.length})
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {assignedTeachers.length === 0 ? (
                <li style={{ opacity: 0.6, fontSize: '0.85rem' }}>Nenhum professor vinculado ainda. Vincule ao lado para permitir acesso à chamada.</li>
              ) : null}
              {assignedTeachers.map(teacher => (
                <li key={teacher.id} style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'rgba(0, 217, 95, 0.06)', border: '1px solid rgba(0, 217, 95, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', fontSize: '0.9rem' }}>{teacher.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>{teacher.email}</span>
                  </div>
                  <TeacherManager courseId={course.id} teacherId={teacher.id} isAssigned={true} />
                </li>
              ))}
            </ul>
          </div>

          {/* Professores Disponíveis */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', fontWeight: 800 }}>
                Outros Professores da Instituição ({availableTeachers.length})
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableTeachers.length === 0 ? (
                <li style={{ opacity: 0.6, fontSize: '0.85rem' }}>Todos os colaboradores já estão vinculados a esta turma.</li>
              ) : null}
              {availableTeachers.map(teacher => (
                <li key={teacher.id} style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', fontSize: '0.9rem' }}>{teacher.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>{teacher.email}</span>
                  </div>
                  <TeacherManager courseId={course.id} teacherId={teacher.id} isAssigned={false} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: ALUNOS MATRICULADOS */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--primary)" />
          Alunos da Turma
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 217, 95, 0.25)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>
              Matriculados ({enrolledStudents.length})
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {enrolledStudents.length === 0 ? <li style={{ opacity: 0.5, fontSize: '0.85rem' }}>Nenhum aluno matriculado.</li> : null}
              {enrolledStudents.map(student => (
                <li key={student.id} style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'rgba(0, 217, 95, 0.06)', border: '1px solid rgba(0, 217, 95, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', fontSize: '0.9rem' }}>{student.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>{student.email}</span>
                  </div>
                  <EnrollmentManager courseId={course.id} studentId={student.id} isEnrolled={true} />
                </li>
              ))}
            </ul>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>
              Alunos Disponíveis ({availableStudents.length})
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableStudents.length === 0 ? <li style={{ opacity: 0.5, fontSize: '0.85rem' }}>Todos os alunos já estão matriculados.</li> : null}
              {availableStudents.map(student => (
                <li key={student.id} style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', fontSize: '0.9rem' }}>{student.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>{student.email}</span>
                  </div>
                  <EnrollmentManager courseId={course.id} studentId={student.id} isEnrolled={false} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
