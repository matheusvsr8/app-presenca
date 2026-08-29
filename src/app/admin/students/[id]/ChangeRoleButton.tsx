'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from './actions';
import { toast } from 'sonner';
import { Shield, UserCheck, GraduationCap, Loader2 } from 'lucide-react';

interface ChangeRoleButtonProps {
  userId: string;
  userName: string;
  currentRole: 'STUDENT' | 'COLLABORATOR' | 'ADMIN';
}

export default function ChangeRoleButton({ userId, userName, currentRole }: ChangeRoleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'COLLABORATOR' | 'ADMIN'>(currentRole);

  const handleRoleChange = (newRole: 'STUDENT' | 'COLLABORATOR' | 'ADMIN') => {
    if (newRole === currentRole) return;

    const roleName = newRole === 'ADMIN' ? 'Administrador' : newRole === 'COLLABORATOR' ? 'Colaborador (Leitor)' : 'Aluno';
    
    if (!confirm(`Deseja alterar a permissão de "${userName}" para ${roleName}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(res.message);
        setSelectedRole(newRole);
      } else {
        toast.error(res.error || 'Erro ao alterar cargo.');
      }
    });
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: '1.25rem',
      marginTop: '1.5rem',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
            Nível de Permissão (Cargo)
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            Defina o que este usuário pode acessar no sistema.
          </p>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: selectedRole === 'ADMIN' 
            ? 'rgba(0, 217, 95, 0.15)' 
            : selectedRole === 'COLLABORATOR' 
            ? 'rgba(59, 130, 246, 0.15)' 
            : 'rgba(255, 255, 255, 0.1)',
          color: selectedRole === 'ADMIN' 
            ? 'var(--primary)' 
            : selectedRole === 'COLLABORATOR' 
            ? '#60a5fa' 
            : 'rgba(255, 255, 255, 0.7)',
          border: '1px solid currentColor'
        }}>
          {selectedRole === 'ADMIN' ? '👑 Administrador' : selectedRole === 'COLLABORATOR' ? '🛡️ Colaborador' : '🎓 Aluno'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Botão Aluno */}
        <button
          disabled={isPending || selectedRole === 'STUDENT'}
          onClick={() => handleRoleChange('STUDENT')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: selectedRole === 'STUDENT' ? 'default' : 'pointer',
            background: selectedRole === 'STUDENT' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: selectedRole === 'STUDENT' ? '#ffffff' : 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            opacity: selectedRole === 'STUDENT' ? 0.6 : 1
          }}
        >
          <GraduationCap size={16} />
          Aluno
        </button>

        {/* Botão Colaborador */}
        <button
          disabled={isPending || selectedRole === 'COLLABORATOR'}
          onClick={() => handleRoleChange('COLLABORATOR')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: selectedRole === 'COLLABORATOR' ? 'default' : 'pointer',
            background: selectedRole === 'COLLABORATOR' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)',
            color: selectedRole === 'COLLABORATOR' ? '#93c5fd' : '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            opacity: selectedRole === 'COLLABORATOR' ? 0.6 : 1
          }}
        >
          <UserCheck size={16} />
          {selectedRole === 'COLLABORATOR' ? 'É Colaborador' : 'Promover a Colaborador'}
        </button>

        {/* Botão Administrador */}
        <button
          disabled={isPending || selectedRole === 'ADMIN'}
          onClick={() => handleRoleChange('ADMIN')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: selectedRole === 'ADMIN' ? 'default' : 'pointer',
            background: selectedRole === 'ADMIN' ? 'rgba(0, 217, 95, 0.2)' : 'rgba(0, 217, 95, 0.08)',
            color: selectedRole === 'ADMIN' ? 'var(--primary)' : 'var(--primary)',
            border: '1px solid rgba(0, 217, 95, 0.3)',
            opacity: selectedRole === 'ADMIN' ? 0.6 : 1
          }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          {selectedRole === 'ADMIN' ? 'É Administrador' : 'Promover a Administrador'}
        </button>
      </div>
    </div>
  );
}
