'use client';

import { useState, useTransition } from 'react';
import { Check, X, FileText, Calendar, User, Eye, AlertCircle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { reviewAbsenceExcuse } from '@/app/student/excuseActions';
import { toast } from 'sonner';

interface ExcuseReviewItem {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  sessionDate: string;
  reason: string;
  documentUrl?: string | null;
  status: string;
  feedback?: string | null;
  createdAt: string;
}

interface ExcuseReviewListProps {
  excuses: ExcuseReviewItem[];
}

export default function ExcuseReviewList({ excuses }: ExcuseReviewListProps) {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = excuses.filter(e => {
    if (filter === 'ALL') return true;
    return e.status === filter;
  });

  const handleApprove = (excuseId: string) => {
    startTransition(async () => {
      const res = await reviewAbsenceExcuse(excuseId, 'APPROVED');
      if (res.success) {
        toast.success('Atestado aprovado e presença abonada com sucesso!');
      } else {
        toast.error(res.error || 'Erro ao aprovar atestado.');
      }
    });
  };

  const handleReject = (excuseId: string) => {
    startTransition(async () => {
      const res = await reviewAbsenceExcuse(excuseId, 'REJECTED', rejectFeedback);
      if (res.success) {
        toast.success('Justificativa recusada.');
        setRejectingId(null);
        setRejectFeedback('');
      } else {
        toast.error(res.error || 'Erro ao recusar justificativa.');
      }
    });
  };

  const pendingCount = excuses.filter(e => e.status === 'PENDING').length;

  return (
    <div>
      {/* Filtros de Status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('PENDING')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: filter === 'PENDING' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: filter === 'PENDING' ? '#fde047' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Pendentes ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: filter === 'APPROVED' ? 'rgba(0, 217, 95, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: filter === 'APPROVED' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Aprovadas ({excuses.filter(e => e.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: filter === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: filter === 'REJECTED' ? '#f87171' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Recusadas ({excuses.filter(e => e.status === 'REJECTED').length})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: filter === 'ALL' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: filter === 'ALL' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Todas ({excuses.length})
        </button>
      </div>

      {/* Lista de Atestados */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', opacity: 0.7 }}>
          Nenhuma justificativa encontrada nesta categoria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              className="glass"
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: item.status === 'PENDING' ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {item.studentName}
                    </h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>({item.studentEmail})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
                    <span><strong>Turma:</strong> {item.courseName}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="var(--primary)" /> Aula de {item.sessionDate}
                    </span>
                  </div>
                </div>

                {/* Badge de Status */}
                <div>
                  {item.status === 'PENDING' && (
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', fontWeight: 800, fontSize: '0.75rem' }}>
                      ⏳ Aguardando Avaliação
                    </span>
                  )}
                  {item.status === 'APPROVED' && (
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0, 217, 95, 0.15)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>
                      🟢 Atestado Aprovado
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 800, fontSize: '0.75rem' }}>
                      🔴 Recusado
                    </span>
                  )}
                </div>
              </div>

              {/* Descrição do Motivo */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '1rem',
                lineHeight: 1.4
              }}>
                <strong>Motivo informado:</strong> {item.reason}
                {item.feedback && (
                  <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#fca5a5' }}>
                    <strong>Observação da recusa:</strong> {item.feedback}
                  </div>
                )}
              </div>

              {/* Ações e Visualizador de Anexo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                {item.documentUrl ? (
                  <button
                    onClick={() => setSelectedDocument(item.documentUrl || null)}
                    style={{
                      background: 'rgba(0, 217, 95, 0.12)',
                      border: '1px solid rgba(0, 217, 95, 0.3)',
                      color: 'var(--primary)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Eye size={14} /> Ver Comprovante / Foto
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Sem arquivo anexado</span>
                )}

                {/* Botões de Decisão (se pendente) */}
                {item.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setRejectingId(rejectingId === item.id ? null : item.id)}
                      disabled={isPending}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#f87171',
                        borderRadius: '8px',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <X size={14} /> Recusar
                    </button>

                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isPending}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#000000',
                        borderRadius: '8px',
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 10px rgba(0, 217, 95, 0.3)'
                      }}
                    >
                      <Check size={15} strokeWidth={3} /> Aprovar & Abonar Falta
                    </button>
                  </div>
                )}
              </div>

              {/* Formulário de Recusa */}
              {rejectingId === item.id && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.85rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px'
                }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600, marginBottom: '4px' }}>
                    Motivo da Recusa (opcional):
                  </label>
                  <input
                    type="text"
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    placeholder="Ex: Documento ilegível ou fora do prazo..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => setRejectingId(null)}
                      style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isPending}
                      style={{ padding: '4px 12px', background: '#ef4444', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Confirmar Recusa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Pré-visualização do Comprovante */}
      {selectedDocument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#070b09',
            border: '1px solid rgba(0, 217, 95, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>
                Visualização do Comprovante
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ overflow: 'auto', textAlign: 'center', flex: 1 }}>
              {selectedDocument.startsWith('data:image') || selectedDocument.startsWith('http') ? (
                <img
                  src={selectedDocument}
                  alt="Atestado"
                  style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src={selectedDocument}
                  style={{ width: '100%', height: '50vh', border: 'none', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
