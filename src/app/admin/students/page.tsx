import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { User, QrCode, ArrowRight } from 'lucide-react';
import styles from './students.module.css';

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const tenantId = user?.user_metadata?.tenantId;

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

      {students.length === 0 ? (
        <div className={styles.emptyState}>Nenhum aluno cadastrado.</div>
      ) : (
        <>
          {/* Tabela para Desktop */}
          <div className={styles.desktopTable}>
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
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: 'rgba(0, 217, 95, 0.1)', 
                          color: 'var(--primary)', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontWeight: 700 
                        }}>
                          Ativo
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/students/${student.id}`} className={styles.linkButton}>
                          Ver Perfil &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards para Mobile (Sem rolagem lateral) */}
          <div className={styles.mobileCards}>
            {students.map((student) => (
              <div key={student.id} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(0, 217, 95, 0.1)',
                      border: '1px solid rgba(0, 217, 95, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{student.name}</h3>
                      <p className={styles.cardSubtitle}>{student.email}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(0, 217, 95, 0.12)',
                    color: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <QrCode size={12} />
                    Ativo
                  </span>
                </div>

                <div className={styles.cardAction}>
                  <Link href={`/admin/students/${student.id}`} className={styles.cardButton}>
                    Ver Perfil Completo & Alterar Cargo <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
