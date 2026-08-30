import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FileCheck, Sparkles } from 'lucide-react';
import ExcuseReviewList from './ExcuseReviewList';
import styles from '../students/students.module.css';

export default async function AdminExcusesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole !== 'ADMIN') redirect('/login');

  const tenantId = dbUser?.tenantId || user?.user_metadata?.tenantId;

  // Busca todas as justificativas dos alunos deste tenant
  const excuses = await prisma.absenceExcuse.findMany({
    where: {
      student: { tenantId }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      student: true,
      session: {
        include: { course: true }
      }
    }
  });

  const formattedExcuses = excuses.map(e => ({
    id: e.id,
    studentName: e.student.name,
    studentEmail: e.student.email,
    courseName: e.session.course.name,
    sessionDate: new Date(e.session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    reason: e.reason,
    documentUrl: e.documentUrl,
    status: e.status,
    feedback: e.feedback,
    createdAt: e.createdAt.toISOString()
  }));

  return (
    <div className={styles.container} style={{ paddingBottom: '6rem' }}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
            <Sparkles size={13} />
            Gestão Escolar
          </div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <FileCheck size={28} color="var(--primary)" />
            Central de Atestados & Justificativas
          </h1>
          <p className={styles.subtitle} style={{ margin: '4px 0 0 0' }}>
            Avalie justificativas de ausência enviadas pelos alunos e abone faltas com 1 clique.
          </p>
        </div>
      </header>

      <ExcuseReviewList excuses={formattedExcuses} />
    </div>
  );
}
