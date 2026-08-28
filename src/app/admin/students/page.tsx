import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './students.module.css';

export default async function StudentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.tenantId;

  if (!tenantId) return null;

  const students = await prisma.user.findMany({
    where: { tenantId, role: 'STUDENT' },
    orderBy: { name: 'asc' },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Alunos</h1>
          <p className={styles.subtitle}>Gerencie os alunos cadastrados na sua instituição.</p>
        </div>
        <Link href="/admin/students/new" className={styles.primaryButton}>
          + Novo Aluno
        </Link>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>QR Code</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>Nenhum aluno cadastrado.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.qrCode || 'Pendente'}</td>
                  <td>
                    <Link href={`/admin/students/${student.id}`} className={styles.linkButton}>
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
