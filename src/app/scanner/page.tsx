import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default async function ScannerDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role === 'STUDENT') {
    redirect('/login');
  }

  const tenantId = session.user.tenantId;

  // Busca todos os cursos do tenant
  const courses = await prisma.course.findMany({ 
    where: { tenantId },
    orderBy: { name: 'asc' } 
  });
  
  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>Selecionar Turma</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Colaborador: {session.user.name}</p>
        </div>
        <a href="/api/auth/signout" style={{ color: 'var(--error)' }} title="Sair">
          <LogOut size={24} />
        </a>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
          Selecione a turma atual para abrir o leitor de QR Code e iniciar uma nova sessão de aula.
        </p>

        {courses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--error)' }}>
            Nenhum curso cadastrado. Peça ao administrador para criar um curso.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {courses.map(course => (
              <Link key={course.id} href={`/scanner/${course.id}`}>
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                >
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{course.name}</span>
                  <span style={{ color: 'var(--primary)' }}>Iniciar Aula &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
