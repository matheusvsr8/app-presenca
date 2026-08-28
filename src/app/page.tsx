import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = user?.user_metadata?.role;

  if (role === 'STUDENT') {
    redirect('/student');
  } else if (role === 'COLLABORATOR') {
    redirect('/scanner');
  } else {
    redirect('/admin');
  }

  return null;
}
