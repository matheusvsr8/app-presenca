import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from '../students.module.css';
import { deleteStudent } from './actions';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

  if (!tenantId || user?.user_metadata?.role !== 'ADMIN') {
    redirect('/login');
  }

  const student = await prisma.user.findFirst({
    where: { id: params.id, tenantId },
  });

  if (!student) {
    return <div>Aluno não encontrado.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{student.name}</h1>
          <p className={styles.subtitle}>{student.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <form action={async () => {
            'use server';
            await deleteStudent(student.id);
          }}>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
              Excluir Aluno
            </button>
          </form>
          <Link href="/admin/students" className={styles.linkButton} style={{ display: 'flex', alignItems: 'center' }}>
            Voltar para Lista
          </Link>
        </div>
      </header>

      <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>QR Code de Acesso</h2>
        
        {student.qrCode ? (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
            <QRCodeSVG value={student.qrCode} size={250} />
          </div>
        ) : (
          <p style={{ color: 'var(--error)' }}>QR Code não gerado para este aluno.</p>
        )}

        <p style={{ marginTop: '2rem', opacity: 0.7, fontSize: '0.875rem' }}>
          Você pode imprimir este código e entregá-lo fisicamente ao aluno, ou ele mesmo pode acessar pelo portal do aluno.
        </p>
      </div>
    </div>
  );
}
