import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ScannerClient from '../ScannerClient';
import Link from 'next/link';

export default async function ScannerCoursePage({ params }: { params: { courseId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user?.user_metadata?.role === 'STUDENT') {
    redirect('/login');
  }

  const tenantId = user?.user_metadata?.tenantId;

  const course = await prisma.course.findFirst({
    where: { id: params.courseId, tenantId }
  });

  if (!course) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Curso não encontrado.</div>;
  }

  // Busca a sessão de HOJE para este curso. Se não existir, cria.
  // Como simplificação, pegamos a última e vemos se é do mesmo dia.
  // Se quisermos que cada entrada crie uma nova sessão, a lógica seria outra.
  // Para este MVP: Apenas pegue a última sessão ou crie uma nova.
  let classSession = await prisma.session.findFirst({
    where: { courseId: course.id },
    orderBy: { date: 'desc' }
  });

  const today = new Date();
  
  // Se não tem sessão ou a última foi em outro dia, crie uma nova.
  if (!classSession || classSession.date.toDateString() !== today.toDateString()) {
    classSession = await prisma.session.create({
      data: {
        courseId: course.id,
        date: today
      }
    });
  }

  return (
    <div style={{ padding: '1rem', textAlign: 'center', paddingBottom: '6rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Leitor de Presença</h1>
        <Link href="/scanner" style={{ color: 'rgba(255,255,255,0.7)' }}>&larr; Voltar</Link>
      </header>

      <p style={{ marginBottom: '1.5rem', fontWeight: 500, fontSize: '1.125rem' }}>
        Registrando presença para: <span style={{ color: 'var(--primary)' }}>{course.name}</span>
      </p>

      <ScannerClient sessionId={classSession.id} />
    </div>
  );
}
