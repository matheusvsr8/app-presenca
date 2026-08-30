'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, FileText, AlertCircle, Clock } from 'lucide-react';
import ExcuseModal from './ExcuseModal';

interface SessionItem {
  id: string;
  date: string;
}

interface AttendanceItem {
  sessionId: string;
  createdAt: string;
}

interface ExcuseItem {
  id: string;
  sessionId: string;
  reason: string;
  documentUrl?: string | null;
  status: string;
  feedback?: string | null;
}

interface StudentTimelineListProps {
  sessions: SessionItem[];
  attendances: AttendanceItem[];
  excuses: ExcuseItem[];
  courseName: string;
}

export default function StudentTimelineList({
  sessions,
  attendances,
  excuses,
  courseName,
}: StudentTimelineListProps) {
  const [selectedExcuseSession, setSelectedExcuseSession] = useState<{
    id: string;
    date: string;
    reason?: string;
    status?: string;
  } | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {sessions.map((session) => {
        const attendance = attendances.find(a => a.sessionId === session.id);
        const excuse = excuses.find(e => e.sessionId === session.id);
        const isPresent = !!attendance;
        const sessionDate = new Date(session.date);

        return (
          <div
            key={session.id}
            style={{
              padding: '1rem 1.1rem',
              borderRadius: '14px',
              background: isPresent 
                ? 'rgba(0, 217, 95, 0.05)' 
                : excuse?.status === 'PENDING'
                  ? 'rgba(234, 179, 8, 0.05)'
                  : 'rgba(239, 68, 68, 0.05)',
              border: `1px solid ${
                isPresent 
                  ? 'rgba(0, 217, 95, 0.2)' 
                  : excuse?.status === 'PENDING'
                    ? 'rgba(234, 179, 8, 0.3)'
                    : 'rgba(239, 68, 68, 0.2)'
              }`,
              borderLeft: `4px solid ${
                isPresent 
                  ? 'var(--primary)' 
                  : excuse?.status === 'PENDING'
                    ? '#eab308'
                    : 'var(--error)'
              }`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>
                  {sessionDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} às {sessionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ fontSize: '0.75rem', color: isPresent ? 'rgba(0, 217, 95, 0.9)' : 'rgba(239, 68, 68, 0.9)', marginTop: '2px', display: 'block' }}>
                  {isPresent 
                    ? `Check-in realizado às ${new Date(attendance.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Ausente (Não compareceu)'
                  }
                </span>
              </div>

              {/* Badge de Status */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: isPresent ? 'rgba(0, 217, 95, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isPresent ? 'var(--primary)' : 'var(--error)',
                fontWeight: 800,
                fontSize: '0.78rem',
                flexShrink: 0
              }}>
                {isPresent ? (
                  <>
                    <CheckCircle2 size={14} />
                    PRESENTE
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    FALTA
                  </>
                )}
              </div>
            </div>

            {/* Ações e Badges para Faltas (Justificativa) */}
            {!isPresent && (
              <div style={{
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {excuse ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    {excuse.status === 'PENDING' && (
                      <span style={{ color: '#fde047', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} /> Justificativa em análise
                      </span>
                    )}
                    {excuse.status === 'APPROVED' && (
                      <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Atestado aprovado (Abonada)
                      </span>
                    )}
                    {excuse.status === 'REJECTED' && (
                      <span style={{ color: '#fca5a5', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={13} /> Justificativa recusada {excuse.feedback ? `(${excuse.feedback})` : ''}
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    Falta registrada para esta aula
                  </span>
                )}

                <button
                  onClick={() => setSelectedExcuseSession({
                    id: session.id,
                    date: sessionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    reason: excuse?.reason,
                    status: excuse?.status,
                  })}
                  style={{
                    background: excuse ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 217, 95, 0.12)',
                    border: excuse ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 217, 95, 0.3)',
                    color: excuse ? '#ffffff' : 'var(--primary)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={12} />
                  {excuse ? 'Ver / Editar Atestado' : 'Justificar Falta'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de Justificativa */}
      {selectedExcuseSession && (
        <ExcuseModal
          sessionId={selectedExcuseSession.id}
          sessionDate={selectedExcuseSession.date}
          courseName={courseName}
          existingReason={selectedExcuseSession.reason}
          existingStatus={selectedExcuseSession.status}
          onClose={() => setSelectedExcuseSession(null)}
        />
      )}
    </div>
  );
}
