import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user?.user_metadata?.role !== 'ADMIN') {
    redirect('/login');
  }

  const tenantId = user?.user_metadata?.tenantId;

  const [studentCount, courseCount, sessionCount] = await Promise.all([
    prisma.user.count({ where: { tenantId, role: 'STUDENT' } }),
    prisma.course.count({ where: { tenantId } }),
    prisma.session.count({ where: { course: { tenantId } } })
  ]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>Dashboard</h1>
        <p style={{ opacity: 0.7 }}>Visão geral da sua instituição.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{studentCount}</h2>
          <p style={{ opacity: 0.8 }}>Alunos Cadastrados</p>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{courseCount}</h2>
          <p style={{ opacity: 0.8 }}>Cursos/Turmas</p>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{sessionCount}</h2>
          <p style={{ opacity: 0.8 }}>Sessões (Aulas) Realizadas</p>
        </div>
      </div>
    </div>
  );
}
