'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { toast } from 'sonner';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        
        if (result?.requiresVerification) {
          toast.warning('Você precisa confirmar seu e-mail antes de entrar.');
          router.push('/verify-email');
        } else {
          toast.success('Login efetuado com sucesso!');
          // O middleware cuidará do redirecionamento
          router.push('/'); 
          router.refresh();
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao entrar.');
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`}>
        <h1 className={styles.logo}>App Presença</h1>
        <p className={styles.subtitle}>Faça login para acessar o sistema</p>

        <form className={styles.form} action={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              className={styles.input}
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Senha</label>
            <input
              className={styles.input}
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button className={styles.button} disabled={isPending} type="submit">
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/register" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
              Sou aluno e não tenho conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
