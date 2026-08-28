import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import FloatingNavbar from './components/FloatingNavbar';
import { Hexagon, User } from 'lucide-react';
import styles from './admin.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
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
            App<span style={{ color: 'var(--primary)' }}>Presença</span>
          </h2>
        </div>

        <div className={styles.userPill}>
          <div className={styles.avatar}>
            <User size={14} color="var(--background)" strokeWidth={3} />
          </div>
          <span className={styles.userName}>
            {session?.user?.name}
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
