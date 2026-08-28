'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

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
            <div style={{ position: 'relative' }}>
              <input
                className={styles.input}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                style={{ width: '100%', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
