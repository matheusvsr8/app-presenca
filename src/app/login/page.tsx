'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import styles from './login.module.css';

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`}>
        <h1 className={styles.logo}>App Presença</h1>
        <p className={styles.subtitle}>Faça login para acessar o sistema</p>

        <form className={styles.form} action={dispatch}>
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

          {errorMessage && (
            <div className={styles.error} aria-live="polite" aria-atomic="true">
              {errorMessage}
            </div>
          )}

          <button className={styles.button} aria-disabled={isPending} type="submit">
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
