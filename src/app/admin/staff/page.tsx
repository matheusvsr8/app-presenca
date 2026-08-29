import Link from 'next/link';
import { getStaff } from './actions';
import styles from '../students/students.module.css';
import { UserCog, Shield, Wrench, Calendar, Mail } from 'lucide-react';
import DeleteStaffButton from './DeleteStaffButton';

export default async function StaffPage() {
  const staffMembers = await getStaff();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCog size={30} />
            Equipe
          </h1>
          <p className={styles.subtitle}>Gerencie administradores e colaboradores.</p>
        </div>
        <Link href="/admin/staff/new" className={styles.primaryButton}>
          + Novo Funcionário
        </Link>
      </div>

      {staffMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum funcionário cadastrado.</p>
        </div>
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
                    <th>Perfil (Role)</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ fontWeight: 600 }}>{member.name}</td>
                      <td>{member.email}</td>
                      <td>
                        <span style={{ 
                          padding: '0.3rem 0.65rem', 
                          background: member.role === 'ADMIN' ? 'rgba(0, 217, 95, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: member.role === 'ADMIN' ? 'var(--primary)' : '#60a5fa',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {member.role === 'ADMIN' ? '👑 Administrador' : '🛡️ Colaborador'}
                        </span>
                      </td>
                      <td>{new Date(member.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <DeleteStaffButton id={member.id} name={member.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards para Mobile (Sem rolagem lateral) */}
          <div className={styles.mobileCards}>
            {staffMembers.map((member) => (
              <div key={member.id} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: member.role === 'ADMIN' ? 'rgba(0, 217, 95, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      border: `1px solid ${member.role === 'ADMIN' ? 'rgba(0, 217, 95, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: member.role === 'ADMIN' ? 'var(--primary)' : '#60a5fa',
                      flexShrink: 0
                    }}>
                      {member.role === 'ADMIN' ? <Shield size={18} /> : <Wrench size={18} />}
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{member.name}</h3>
                      <p className={styles.cardSubtitle}>
                        <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.55rem', 
                    background: member.role === 'ADMIN' ? 'rgba(0, 217, 95, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: member.role === 'ADMIN' ? 'var(--primary)' : '#93c5fd',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {member.role === 'ADMIN' ? 'ADMIN' : 'COLABORADOR'}
                  </span>
                </div>

                <div className={styles.cardStatsGrid} style={{ gridTemplateColumns: '1fr' }}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Cadastrado em
                    </span>
                    <span className={styles.statValue} style={{ fontSize: '0.85rem' }}>
                      {new Date(member.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className={styles.cardAction} style={{ justifyContent: 'flex-start' }}>
                  <DeleteStaffButton id={member.id} name={member.name} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
