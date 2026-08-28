'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStaffUser } from '../actions';
import { toast } from 'sonner';

export default function NewStaffPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createStaffUser(formData);
        toast.success('Funcionário cadastrado com sucesso!');
        router.push('/admin/staff');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao cadastrar funcionário.');
      }
    });
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Novo Funcionário</h1>
        <Link href="/admin/staff" style={{ color: 'rgba(255,255,255,0.7)' }}>&larr; Voltar</Link>
      </header>

      <form action={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        background: 'var(--card-bg)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome Completo</label>
          <input 
            type="text" 
            name="name" 
            required
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--card-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--foreground)'
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>E-mail (Login)</label>
          <input 
            type="email" 
            name="email" 
            required
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--card-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--foreground)'
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Senha Inicial</label>
          <input 
            type="password" 
            name="password" 
            required
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--card-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--foreground)'
            }} 
          />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>O funcionário usará esta senha para entrar.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Perfil (Nível de Acesso)</label>
          <select 
            name="role" 
            required
            style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--card-border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              cursor: 'pointer'
            }} 
          >
            <option value="COLLABORATOR">Colaborador (Acesso restrito ao Leitor de QR Code)</option>
            <option value="ADMIN">Administrador (Acesso total ao painel)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{ 
            background: 'var(--primary)', 
            color: 'var(--primary-foreground)',
            padding: '1rem',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            marginTop: '1rem'
          }}
        >
          {isPending ? 'Cadastrando...' : 'Cadastrar Funcionário'}
        </button>
      </form>
    </div>
  );
}
