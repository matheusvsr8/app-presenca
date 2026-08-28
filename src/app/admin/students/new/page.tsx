import { createStudent } from './actions';
import styles from '../students.module.css';
import Link from 'next/link';

export default function NewStudentPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Novo Aluno</h1>
          <p className={styles.subtitle}>Cadastre um novo aluno na instituição.</p>
        </div>
        <Link href="/admin/students" className={styles.linkButton}>
          Voltar
        </Link>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <form action={createStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome Completo</label>
            <input 
              id="name"
              name="name" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500 }}>E-mail</label>
            <input 
              id="email"
              type="email" 
              name="email" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }} 
            />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--primary)' }}>
            A senha padrão será <strong>123456</strong> e o QR Code será gerado automaticamente.
          </div>

          <button type="submit" className={styles.primaryButton} style={{ marginTop: '1rem' }}>
            Salvar Aluno
          </button>
        </form>
      </div>
    </div>
  );
}
