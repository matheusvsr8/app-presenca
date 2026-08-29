import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FloatingNavbar from './components/FloatingNavbar';
import { User } from 'lucide-react';
import Logo from '@/components/Logo';
import styles from './admin.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  const role = dbUser?.role || user?.user_metadata?.role;

  if (role !== 'ADMIN') {
    if (role === 'COLLABORATOR') {
      redirect('/scanner');
    } else {
      redirect('/student');
    }
  }

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        <Logo size={36} />

        <div className={styles.userPill}>
          <div className={styles.avatar}>
            <User size={14} color="var(--background)" strokeWidth={3} />
          </div>
          <span className={styles.userName}>
            {user?.user_metadata?.name}
          </span>
        </div>
      </header>
      <FloatingNavbar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
