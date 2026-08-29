import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Busca o papel REAL e ATUALIZADO no banco de dados em tempo real
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const role = dbUser?.role || user?.user_metadata?.role;

  if (role === 'ADMIN') {
    redirect('/admin');
  } else if (role === 'COLLABORATOR') {
    redirect('/scanner');
  } else {
    redirect('/student');
  }
}
