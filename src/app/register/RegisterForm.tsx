'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerStudent } from './actions';
import { toast } from 'sonner';
import styles from '../login/login.module.css';

export default function RegisterForm({ courses }: { courses: { id: string, name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await registerStudent(formData);
        toast.success('Conta criada com sucesso! Faça login para ver seu QR Code.');
        router.push('/login');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao criar conta.');
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`} style={{ maxWidth: '450px' }}>
        <h1 className={styles.logo}>Cadastro de Aluno</h1>
        <p className={styles.subtitle}>Crie sua conta e escolha sua turma</p>

        <form action={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nome Completo</label>
            <input
              className={styles.input}
              type="text"
              name="name"
              placeholder="Digite seu nome"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>E-mail</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Turma (Curso)</label>
            <select
              className={styles.input}
              name="courseId"
              required
              defaultValue=""
              style={{ cursor: 'pointer' }}
            >
              <option value="" disabled>-- Selecione sua turma --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <button className={styles.button} disabled={isPending} type="submit" style={{ marginTop: '1rem' }}>
            {isPending ? 'Criando conta...' : 'Cadastrar e Matricular'}
          </button>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Já tem uma conta? <span style={{ color: 'var(--primary)' }}>Fazer login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
