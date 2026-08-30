'use client';

import { useTransition } from 'react';
import { assignTeacher, removeTeacher } from './actions';
import { toast } from 'sonner';
import { UserCheck, UserMinus, Plus } from 'lucide-react';

interface TeacherManagerProps {
  courseId: string;
  teacherId: string;
  isAssigned: boolean;
}

export default function TeacherManager({
  courseId,
  teacherId,
  isAssigned,
}: TeacherManagerProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isAssigned) {
          await removeTeacher(courseId, teacherId);
          toast.success('Professor desvinculado da turma.');
        } else {
          await assignTeacher(courseId, teacherId);
          toast.success('Professor vinculado à turma com sucesso!');
        }
      } catch (e: any) {
        toast.error(e.message || 'Erro ao atualizar vinculação.');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      style={{
        padding: '0.4rem 0.85rem',
        borderRadius: '8px',
        border: isAssigned ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(0, 217, 95, 0.4)',
        background: isAssigned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 217, 95, 0.15)',
        color: isAssigned ? '#fca5a5' : 'var(--primary)',
        fontSize: '0.8rem',
        fontWeight: 700,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.15s'
      }}
    >
      {isPending ? (
        '...'
      ) : isAssigned ? (
        <>
          <UserMinus size={13} />
          Remover
        </>
      ) : (
        <>
          <Plus size={13} strokeWidth={2.5} />
          Vincular à Turma
        </>
      )}
    </button>
  );
}
