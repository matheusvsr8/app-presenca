import { createCourse } from './actions';
import styles from '../../students/students.module.css';
import Link from 'next/link';

export default function NewCoursePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Novo Curso</h1>
          <p className={styles.subtitle}>Crie uma nova turma ou curso.</p>
        </div>
        <Link href="/admin/courses" className={styles.linkButton}>
          Voltar
        </Link>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <form action={createCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do Curso/Turma</label>
            <input 
              id="name"
              name="name" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }} 
            />
          </div>

          <button type="submit" className={styles.primaryButton} style={{ marginTop: '1rem' }}>
            Salvar Curso
          </button>
        </form>
      </div>
    </div>
  );
}
