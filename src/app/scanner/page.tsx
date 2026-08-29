import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { LogOut, QrCode, BookOpen, Camera, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

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

  // Busca todos os cursos disponíveis com contagem de alunos
  const courses = tenantId 
    ? await prisma.course.findMany({ 
        where: { tenantId },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      })
    : await prisma.course.findMany({ 
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      });
  
  return (
    <div style={{ padding: '1.25rem 1rem', maxWidth: '650px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Header com Logo e Logout */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <Logo size={34} />
        
        <a href="/api/auth/signout" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          color: '#ef4444', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.25)', 
          padding: '0.45rem 0.9rem', 
          borderRadius: '9999px', 
          textDecoration: 'none', 
          fontSize: '0.85rem', 
          fontWeight: 700 
        }} title="Sair da Conta">
          <LogOut size={16} />
          Sair
        </a>
      </header>

      {/* Banner de Boas-Vindas */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
          <Sparkles size={14} />
          Portal do Colaborador
        </div>
        <h1 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1.65rem', fontWeight: 800 }}>
          Selecionar Turma
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.65)', margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>
          Olá, <strong>{dbUser?.name || user?.user_metadata?.name || 'Professor'}</strong>! Escolha a turma abaixo para abrir a câmera e iniciar a chamada.
        </p>
      </div>

      {/* Lista de Turmas com Botões Proeminentes */}
      {courses.length === 0 ? (
        <div style={{ 
          padding: '3rem 1.5rem', 
          textAlign: 'center', 
          background: 'rgba(239, 68, 68, 0.08)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '16px', 
          color: 'var(--error)' 
        }}>
          Nenhuma turma encontrada. Peça ao administrador para cadastrar os cursos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course.id} style={{
              background: 'var(--card-bg, rgba(20, 26, 22, 0.8))',
              border: '1px solid rgba(0, 217, 95, 0.2)',
              borderRadius: '16px',
              padding: '1.35rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'border-color 0.2s, transform 0.2s'
            }}>
              {/* Topo do Card: Nome e Alunos */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(0, 217, 95, 0.12)',
                    border: '1px solid rgba(0, 217, 95, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                      {course.name}
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px', display: 'block' }}>
                      {course._count.enrollments} {course._count.enrollments === 1 ? 'aluno matriculado' : 'alunos matriculados'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Largo e Imponente */}
              <Link 
                href={`/scanner/${course.id}`} 
                style={{ 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #00d95f 0%, #00b34d 100%)',
                  color: '#000000',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02rem',
                  boxShadow: '0 4px 15px rgba(0, 217, 95, 0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <Camera size={18} strokeWidth={2.5} />
                <span>Abrir Câmera e Escanear</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
