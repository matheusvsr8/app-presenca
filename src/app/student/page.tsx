import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './student.module.css';
import { QRCodeSVG } from 'qrcode.react';

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className={styles.title} style={{ margin: 0 }}>Olá, {user?.name}</h1>
          <a href="/api/auth/signout" style={{ color: 'var(--error)', fontWeight: 'bold' }}>Sair</a>
        </div>
        <p className={styles.subtitle}>Área do Aluno</p>
      </header>

      <main className={styles.main}>
        <div className={`${styles.card} glass`}>
          <h2>Seu QR Code de Acesso</h2>
          <div className={styles.qrPlaceholder}>
            {user?.qrCode ? (
              <QRCodeSVG value={user.qrCode} size={200} fgColor="var(--primary)" bgColor="transparent" />
            ) : (
              <p>Você não possui um QR Code ainda.</p>
            )}
          </div>
          <p className={styles.instructions}>Apresente este código ao chegar na aula.</p>
        </div>
      </main>
    </div>
  );
}
