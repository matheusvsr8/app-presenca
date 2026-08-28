'use client';

import { useTransition, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmailAction } from './actions';
import { toast } from 'sonner';
import styles from '../login/login.module.css';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await verifyEmailAction(email, code);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        
        toast.success('E-mail verificado com sucesso! Pode fazer login.');
        router.push('/login');
      } catch (error: any) {
        toast.error(error.message || 'Erro inesperado.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>E-mail</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          readOnly={!!searchParams.get('email')}
          style={{ opacity: searchParams.get('email') ? 0.7 : 1 }}
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label className={styles.label}>Código de Segurança</label>
        <input
          className={styles.input}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="00000000"
          maxLength={8}
          required
          style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }}
        />
      </div>

      <button className={styles.button} disabled={isPending || code.length < 6} type="submit" style={{ marginTop: '1rem' }}>
        {isPending ? 'Verificando...' : 'Verificar E-mail'}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`} style={{ maxWidth: '400px' }}>
        <h1 className={styles.logo}>Verificação</h1>
        <p className={styles.subtitle}>Digite o código enviado para o seu e-mail.</p>
        <Suspense fallback={<div>Carregando...</div>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
