import Link from 'next/link';
import { getStaff } from './actions';
import styles from '../students/students.module.css';
import { UserCog } from 'lucide-react';
import DeleteStaffButton from './DeleteStaffButton';

export default async function StaffPage() {
  const staffMembers = await getStaff();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCog size={32} />
            Equipe
          </h1>
          <p className={styles.subtitle}>Gerencie administradores e colaboradores.</p>
        </div>
        <Link href="/admin/staff/new" className={styles.primaryButton}>
          Cadastrar Funcionário
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {staffMembers.length > 0 ? (
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
                  <td style={{ fontWeight: 500 }}>{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: member.role === 'ADMIN' ? 'rgba(0, 217, 95, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      color: member.role === 'ADMIN' ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {member.role === 'ADMIN' ? 'Administrador' : 'Colaborador (Leitor)'}
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
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum funcionário cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
