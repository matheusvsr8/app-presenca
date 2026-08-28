'use client';

import { useTransition } from 'react';
import { deleteStaffUser } from './actions';
import { toast } from 'sonner';

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja remover o funcionário ${name}? Ele perderá o acesso imediatamente.`)) {
      startTransition(async () => {
        try {
          await deleteStaffUser(id);
          toast.success('Funcionário removido com sucesso!');
        } catch (error: any) {
          toast.error(error.message || 'Erro ao remover funcionário.');
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      style={{
        color: 'var(--error)',
        background: 'transparent',
        border: 'none',
        fontWeight: 500,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1
      }}
    >
      {isPending ? 'Removendo...' : 'Remover'}
    </button>
  );
}
