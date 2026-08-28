'use client';

import { useTransition } from 'react';
import { enrollStudent, removeStudent } from './actions';

export default function EnrollmentManager({ 
  courseId, 
  studentId, 
  isEnrolled 
}: { 
  courseId: string, 
  studentId: string, 
  isEnrolled: boolean 
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (isEnrolled) {
        await removeStudent(courseId, studentId);
      } else {
        await enrollStudent(courseId, studentId);
      }
    });
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isPending}
      style={{
        background: 'transparent',
        border: 'none',
        color: isEnrolled ? 'var(--error)' : 'var(--primary)',
        cursor: isPending ? 'wait' : 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem'
      }}
    >
      {isPending ? '...' : isEnrolled ? 'Remover' : 'Adicionar'}
    </button>
  );
}
