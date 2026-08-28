import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FloatingNavbar from './components/FloatingNavbar';
import { Hexagon, User } from 'lucide-react';
import styles from './admin.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user?.user_metadata?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className={styles.layoutWrapper}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <Hexagon fill="var(--primary)" color="var(--primary)" size={28} />
          </div>
          <h2 className={styles.logoText}>
            Log<span style={{ color: 'var(--primary)' }}>QR</span>
          </h2>
        </div>

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
