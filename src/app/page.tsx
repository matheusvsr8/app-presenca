import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  if (role === 'STUDENT') {
    redirect('/student');
  } else if (role === 'COLLABORATOR') {
    redirect('/scanner');
  } else {
    redirect('/admin');
  }

  return null;
}
