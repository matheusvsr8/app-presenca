import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { LogOut, BookOpen, ChevronRight, Sparkles, Users, AlertCircle } from 'lucide-react';
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
  const isAdmin = userRole === 'ADMIN';

  // Se for ADMIN, vê todos os cursos da instituição. Se for COLLABORATOR, apenas os cursos onde está atribuído!
  const courses = isAdmin
    ? await prisma.course.findMany({ 
        where: { tenantId },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { enrollments: true, sessions: true }
          }
        }
      })
    : await prisma.course.findMany({ 
        where: { 
          tenantId,
          teachers: {
            some: {
              teacherId: user.id
            }
          }
        },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { enrollments: true, sessions: true }
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
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
          <Sparkles size={14} />
          {isAdmin ? 'Acesso Administrativo' : 'Portal do Professor'}
        </div>
        <h1 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1.65rem', fontWeight: 800 }}>
          {isAdmin ? 'Todas as Turmas' : 'Minhas Turmas'}
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.65)', margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>
          Olá, <strong>{dbUser?.name || user?.user_metadata?.name || 'Professor'}</strong>! {isAdmin ? 'Acesse qualquer turma da instituição para gerenciar e escanear.' : 'Abaixo estão listadas as turmas atribuídas a você pelo Administrador.'}
        </p>
      </div>

      {/* Lista de Turmas com restrição por professor */}
      {courses.length === 0 ? (
        <div style={{ 
          padding: '2.5rem 1.5rem', 
          textAlign: 'center', 
          background: 'rgba(234, 179, 8, 0.08)', 
          border: '1px solid rgba(234, 179, 8, 0.3)', 
          borderRadius: '16px', 
          color: '#fde047' 
        }}>
          <AlertCircle size={36} style={{ margin: '0 auto 12px auto', display: 'block', color: '#eab308' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>
            Nenhuma turma atribuída
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
            Você ainda não foi vinculado a nenhuma turma. Peça ao Administrador para atribuir seus cursos no painel da coordenação.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(course => (
            <Link 
              key={course.id} 
              href={`/scanner/${course.id}`}
              style={{
                textDecoration: 'none',
                background: 'var(--card-bg, rgba(20, 26, 22, 0.8))',
                border: '1px solid rgba(0, 217, 95, 0.2)',
                borderRadius: '16px',
                padding: '1.35rem',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              {/* Topo do Card: Nome e Alunos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(0, 217, 95, 0.12)',
                  border: '1px solid rgba(0, 217, 95, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <BookOpen size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                    {course.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '3px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} /> {course._count.enrollments} {course._count.enrollments === 1 ? 'aluno' : 'alunos'}
                    </span>
                    <span>•</span>
                    <span>{course._count.sessions} {course._count.sessions === 1 ? 'aula' : 'aulas'}</span>
                  </div>
                </div>
              </div>

              {/* Ícone de Acessar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
