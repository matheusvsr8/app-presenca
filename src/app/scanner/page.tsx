import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { LogOut, QrCode } from 'lucide-react';

export default async function ScannerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Busca o usuário no banco de dados para checar a role e o tenant com segurança
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole === 'STUDENT') {
    redirect('/student');
  }

  const tenantId = dbUser?.tenantId || user?.user_metadata?.tenantId;

  // Busca todos os cursos disponíveis
  const courses = tenantId 
    ? await prisma.course.findMany({ 
        where: { tenantId },
        orderBy: { name: 'asc' } 
      })
    : await prisma.course.findMany({ 
        orderBy: { name: 'asc' } 
      });
  
  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '700px', margin: '0 auto', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={26} />
            Leitor de Presença
          </h1>
          <p style={{ opacity: 0.7, margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Colaborador: {dbUser?.name || user?.user_metadata?.name || 'Professor'}
          </p>
        </div>
        <a href="/api/auth/signout" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          color: 'var(--error)', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.25)', 
          padding: '0.4rem 0.85rem', 
          borderRadius: '20px', 
          textDecoration: 'none', 
          fontSize: '0.85rem', 
          fontWeight: 600 
        }} title="Sair">
          <LogOut size={16} />
          Sair
        </a>
      </header>

      <div className="glass" style={{ padding: '2rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ marginBottom: '1.5rem', opacity: 0.85, fontSize: '0.95rem' }}>
          Selecione a turma para abrir a câmera e escanear os QR Codes dos alunos:
        </p>

        {courses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--error)' }}>
            Nenhum curso cadastrado ainda. Peça ao administrador para criar uma turma.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {courses.map(course => (
              <Link key={course.id} href={`/scanner/${course.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color var(--transition-fast), transform var(--transition-fast)'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', display: 'block' }}>
                      {course.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      Clique para iniciar a chamada
                    </span>
                  </div>
                  <span style={{ 
                    color: '#000000', 
                    background: 'var(--primary)', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    fontSize: '0.85rem' 
                  }}>
                    Escanear &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
