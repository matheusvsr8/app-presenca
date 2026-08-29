'use client';

import { useState } from 'react';
import { Users, CheckCircle2, XCircle, UserCheck, UserX, Clock } from 'lucide-react';

interface StudentAttendanceStatus {
  id: string;
  name: string;
  email: string;
  isPresent: boolean;
  checkedInAt?: string;
}

interface ClassAttendanceListProps {
  students: StudentAttendanceStatus[];
  sessionDate: string;
}

export default function ClassAttendanceList({
  students,
  sessionDate,
}: ClassAttendanceListProps) {
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const presenceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const filteredStudents = students.filter(s => {
    if (filter === 'present') return s.isPresent;
    if (filter === 'absent') return !s.isPresent;
    return true;
  });

  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      {/* Placar Rápido de Frequência da Aula */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '8px', 
        marginBottom: '1rem',
        textAlign: 'center' 
      }}>
        <div style={{
          background: 'rgba(0, 217, 95, 0.1)',
          border: '1px solid rgba(0, 217, 95, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 0.5rem'
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            {presentCount}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, marginTop: '4px', textTransform: 'uppercase' }}>
            Presentes
          </div>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '0.75rem 0.5rem'
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--error)', lineHeight: 1 }}>
            {absentCount}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, marginTop: '4px', textTransform: 'uppercase' }}>
            Faltas
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '0.75rem 0.5rem'
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {presenceRate}%
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, marginTop: '4px', textTransform: 'uppercase' }}>
            Assiduidade
          </div>
        </div>
      </div>

      {/* Cabeçalho da Lista e Filtros */}
      <div className="glass" style={{
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} color="var(--primary)" />
              Lista de Chamada da Turma
            </h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px', display: 'block' }}>
              {students.length} alunos matriculados nesta turma
            </span>
          </div>

          {/* Botões de Filtro */}
          <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filter === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setFilter('present')}
              style={{
                background: filter === 'present' ? 'rgba(0, 217, 95, 0.2)' : 'transparent',
                color: filter === 'present' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Presentes ({presentCount})
            </button>
            <button
              onClick={() => setFilter('absent')}
              style={{
                background: filter === 'absent' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: filter === 'absent' ? '#f87171' : 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Faltantes ({absentCount})
            </button>
          </div>
        </div>

        {/* Lista de Alunos */}
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
            Nenhum aluno encontrado neste filtro.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
            {filteredStudents.map(student => (
              <div
                key={student.id}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  background: student.isPresent ? 'rgba(0, 217, 95, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${student.isPresent ? 'rgba(0, 217, 95, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  borderLeft: `4px solid ${student.isPresent ? 'var(--primary)' : 'var(--error)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {student.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', opacity: 0.55, wordBreak: 'break-all', display: 'block' }}>
                    {student.email}
                  </span>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: student.isPresent ? 'rgba(0, 217, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: student.isPresent ? 'var(--primary)' : 'var(--error)',
                    fontWeight: 800,
                    fontSize: '0.72rem'
                  }}>
                    {student.isPresent ? (
                      <>
                        <CheckCircle2 size={12} />
                        PRESENTE
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        FALTA
                      </>
                    )}
                  </span>
                  {student.isPresent && student.checkedInAt && (
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '2px' }}>
                      {student.checkedInAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
