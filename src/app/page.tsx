import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = user?.user_metadata?.role;

  if (role === 'ADMIN') {
    redirect('/admin');
  } else if (role === 'COLLABORATOR') {
    redirect('/scanner');
  } else {
    redirect('/student');
  }

  return null;
}
