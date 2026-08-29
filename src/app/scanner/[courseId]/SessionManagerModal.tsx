'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Check, ChevronDown, Sparkles, X } from 'lucide-react';
import { createClassSession } from '../actions';
import { toast } from 'sonner';

interface SessionItem {
  id: string;
  date: string;
  attendanceCount: number;
}

interface SessionManagerModalProps {
  courseId: string;
  courseName: string;
  activeSessionId: string;
  sessions: SessionItem[];
}

export default function SessionManagerModal({
  courseId,
  courseName,
  activeSessionId,
  sessions,
}: SessionManagerModalProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const todayDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const [sessionDate, setSessionDate] = useState(todayDate);
  const [sessionTime, setSessionTime] = useState(currentTime);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate) {
      toast.error('Informe a data da aula.');
      return;
    }

    startTransition(async () => {
      const res = await createClassSession(courseId, sessionDate, sessionTime);
      if (res.success && res.sessionId) {
        toast.success('Sessão de aula criada com sucesso!');
        setIsModalOpen(false);
        router.push(`/scanner/${courseId}?sessionId=${res.sessionId}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao criar sessão.');
      }
    });
  };

  const handleSelectSession = (sessionId: string) => {
    setIsListOpen(false);
    router.push(`/scanner/${courseId}?sessionId=${sessionId}`);
    router.refresh();
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Banner da Sessão Ativa */}
      <div style={{
        background: 'rgba(0, 217, 95, 0.08)',
        border: '1px solid rgba(0, 217, 95, 0.3)',
        borderRadius: '16px',
        padding: '1.1rem 1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem', display: 'block' }}>
              Chamada Ativa
            </span>
            <h2 style={{ margin: '2px 0 0 0', fontWeight: 800, fontSize: '1.2rem', color: '#ffffff' }}>
              {courseName}
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'var(--primary)',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              padding: '0.5rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 10px rgba(0, 217, 95, 0.3)',
              flexShrink: 0
            }}
          >
            <Plus size={15} strokeWidth={3} />
            Nova Aula
          </button>
        </div>

        {/* Informações da Data e Horário da Sessão Atual */}
        {activeSession && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="var(--primary)" />
                {new Date(activeSession.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="var(--primary)" />
                {new Date(activeSession.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {sessions.length > 1 && (
              <button
                onClick={() => setIsListOpen(!isListOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Trocar Aula <ChevronDown size={14} />
              </button>
            )}
          </div>
        )}

        {/* Dropdown de Histórico de Sessões da Turma */}
        {isListOpen && sessions.length > 1 && (
          <div style={{
            marginTop: '0.85rem',
            background: '#070b09',
            border: '1px solid rgba(0, 217, 95, 0.25)',
            borderRadius: '12px',
            overflow: 'hidden',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {sessions.map(s => {
              const isCurrent = s.id === activeSessionId;
              const dateObj = new Date(s.date);
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  style={{
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isCurrent ? 'rgba(0, 217, 95, 0.12)' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={13} color={isCurrent ? 'var(--primary)' : 'rgba(255,255,255,0.5)'} />
                    <span style={{ color: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.7)', fontWeight: isCurrent ? 700 : 500 }}>
                      {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} às {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    {s.attendanceCount} presenças
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Criar Nova Aula com Data e Horário */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 7, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0d1a12 0%, #050a07 100%)',
            border: '1.5px solid var(--primary, #00d95f)',
            borderRadius: '20px',
            padding: '1.75rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 0 40px rgba(0, 217, 95, 0.3)',
            position: 'relative',
            textAlign: 'left'
          }}>
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05rem', marginBottom: '4px' }}>
              <Sparkles size={14} />
              Criar Sessão de Aula
            </div>

            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              Nova Aula para {courseName}
            </h3>

            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  📅 Data da Aula
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  ⏰ Horário da Chamada / Início da Aula
                </label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    background: 'var(--primary)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 217, 95, 0.3)',
                    opacity: isPending ? 0.7 : 1
                  }}
                >
                  {isPending ? 'Criando Aula...' : 'Confirmar & Iniciar Chamada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
