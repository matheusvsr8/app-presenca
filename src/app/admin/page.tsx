import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, BookOpen, Calendar, Camera, FileCheck, FileBarChart, Sparkles } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole !== 'ADMIN') {
    redirect('/login');
  }

  const tenantId = dbUser?.tenantId || user?.user_metadata?.tenantId;

  const [studentCount, courseCount, sessionCount, pendingExcusesCount] = await Promise.all([
    prisma.user.count({ where: { tenantId, role: 'STUDENT' } }),
    prisma.course.count({ where: { tenantId } }),
    prisma.session.count({ where: { course: { tenantId } } }),
    prisma.absenceExcuse.count({ where: { student: { tenantId }, status: 'PENDING' } })
  ]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
          <Sparkles size={14} />
          Painel de Controle Central
        </div>
        <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 800, margin: '0 0 4px 0' }}>
          Visão Geral
        </h1>
        <p style={{ opacity: 0.7, margin: 0, fontSize: '0.95rem' }}>
          Acompanhe métricas, gerencie turmas, alunos, atestados e acesse o leitor de chamadas.
        </p>
      </header>

      {/* Grid de Métricas Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 217, 95, 0.25)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Alunos Matriculados</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, margin: '0.5rem 0 0 0' }}>{studentCount}</h2>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 217, 95, 0.25)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Cursos & Turmas</span>
            <BookOpen size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, margin: '0.5rem 0 0 0' }}>{courseCount}</h2>
        </div>

        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0, 217, 95, 0.25)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Aulas Realizadas</span>
            <Calendar size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, margin: '0.5rem 0 0 0' }}>{sessionCount}</h2>
        </div>

        <div className="glass" style={{ 
          padding: '1.5rem', 
          borderRadius: '16px', 
          border: pendingExcusesCount > 0 ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(0, 217, 95, 0.25)', 
          background: pendingExcusesCount > 0 ? 'rgba(234, 179, 8, 0.08)' : 'inherit',
          textAlign: 'left' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: pendingExcusesCount > 0 ? '#fde047' : 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Atestados Pendentes</span>
            <FileCheck size={20} color={pendingExcusesCount > 0 ? '#eab308' : 'var(--primary)'} />
          </div>
          <h2 style={{ fontSize: '2.5rem', color: pendingExcusesCount > 0 ? '#fef08a' : '#ffffff', fontWeight: 800, margin: '0.5rem 0 0 0' }}>{pendingExcusesCount}</h2>
        </div>
      </div>

      {/* Ações Rápidas do Administrador */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
        Ações Rápidas
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Abrir Leitor / Scanner (Poder do Colaborador) */}
        <Link 
          href="/scanner" 
          style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, rgba(0, 217, 95, 0.15) 0%, rgba(0, 217, 95, 0.05) 100%)',
            border: '1px solid rgba(0, 217, 95, 0.35)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            flexShrink: 0
          }}>
            <Camera size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Abrir Leitor de QR Code
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px', display: 'block' }}>
              Fazer chamada e ler presenças com a câmera
            </span>
          </div>
        </Link>

        {/* Central de Atestados */}
        <Link 
          href="/admin/excuses" 
          style={{
            textDecoration: 'none',
            background: pendingExcusesCount > 0 ? 'rgba(234, 179, 8, 0.1)' : 'var(--card-bg)',
            border: pendingExcusesCount > 0 ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: pendingExcusesCount > 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: pendingExcusesCount > 0 ? '#fde047' : 'var(--primary)',
            flexShrink: 0
          }}>
            <FileCheck size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Central de Atestados
            </h4>
            <span style={{ fontSize: '0.8rem', color: pendingExcusesCount > 0 ? '#fef08a' : 'rgba(255,255,255,0.6)', marginTop: '2px', display: 'block' }}>
              {pendingExcusesCount > 0 ? `${pendingExcusesCount} justificativas aguardando análise` : 'Avaliar atestados e abonar faltas'}
            </span>
          </div>
        </Link>

        {/* Gerenciar Alunos */}
        <Link 
          href="/admin/students" 
          style={{
            textDecoration: 'none',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0
          }}>
            <Users size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Ver Alunos & Perfis
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px', display: 'block' }}>
              Consultar dados, matrículas e alterar cargos
            </span>
          </div>
        </Link>

        {/* Relatórios de Frequência */}
        <Link 
          href="/admin/reports" 
          style={{
            textDecoration: 'none',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0
          }}>
            <FileBarChart size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Relatórios de Presença
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px', display: 'block' }}>
              Gráficos, exportação CSV e alertas de risco
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
