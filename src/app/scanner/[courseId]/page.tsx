import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScannerClient from '../ScannerClient';
import Link from 'next/link';

export default async function ScannerCoursePage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> | { courseId: string } 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const userRole = dbUser?.role || user?.user_metadata?.role;
  if (userRole === 'STUDENT') {
    redirect('/student');
  }

  const resolvedParams = await Promise.resolve(params);
  const courseId = resolvedParams.courseId;

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  if (!course) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <h2>Turma não encontrada.</h2>
        <Link href="/scanner" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>
          &larr; Voltar para lista de turmas
        </Link>
      </div>
    );
  }

  // Busca ou cria a sessão de HOJE para este curso.
  const today = new Date();
  let classSession = await prisma.session.findFirst({
    where: { courseId: course.id },
    orderBy: { date: 'desc' }
  });

  // Se não tem sessão ou a última foi em outro dia, cria uma nova.
  if (!classSession || classSession.date.toDateString() !== today.toDateString()) {
    classSession = await prisma.session.create({
      data: {
        courseId: course.id,
        date: today
      }
    });
  }

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.4rem' }}>Leitor de Presença</h1>
        <Link href="/scanner" style={{ 
          color: 'rgba(255,255,255,0.7)', 
          textDecoration: 'none', 
          fontSize: '0.9rem',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 12px',
          borderRadius: '8px'
        }}>
          &larr; Trocar Turma
        </Link>
      </header>

      <div style={{ marginBottom: '1.5rem', background: 'rgba(0, 217, 95, 0.08)', border: '1px solid rgba(0, 217, 95, 0.25)', padding: '1rem', borderRadius: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
          Sessão Aberta
        </span>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: '#ffffff' }}>
          {course.name}
        </p>
      </div>

      <ScannerClient sessionId={classSession.id} />
    </div>
  );
}
