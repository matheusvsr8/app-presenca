'use client';

import { useState, useTransition } from 'react';
import { FileText, UploadCloud, X, Sparkles, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { submitAbsenceExcuse } from './excuseActions';
import { toast } from 'sonner';

interface ExcuseModalProps {
  sessionId: string;
  sessionDate: string;
  courseName: string;
  onClose: () => void;
  existingReason?: string;
  existingStatus?: string;
}

export default function ExcuseModal({
  sessionId,
  sessionDate,
  courseName,
  onClose,
  existingReason = '',
  existingStatus,
}: ExcuseModalProps) {
  const [reason, setReason] = useState(existingReason);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Informe o motivo da ausência.');
      return;
    }

    startTransition(async () => {
      const res = await submitAbsenceExcuse(sessionId, reason, documentBase64 || undefined);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.error || 'Erro ao enviar justificativa.');
      }
    });
  };

  return (
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
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 0 40px rgba(0, 217, 95, 0.3)',
        position: 'relative',
        textAlign: 'left'
      }}>
        {/* Fechar */}
        <button
          onClick={onClose}
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
          Justificativa de Ausência
        </div>

        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
          Enviar Atestado / Motivo
        </h3>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)' }}>
          {courseName} • Aula de {sessionDate}
        </p>

        {existingStatus === 'PENDING' && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#fef08a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            Você já possui uma justificativa em análise para esta aula. Ao enviar, você atualizará os dados.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
              Motivo da Falta (ex: Atestado médico, consulta, etc)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Descreva brevemente o motivo da sua ausência..."
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
              Comprovante / Foto do Atestado (Opcional)
            </label>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1.5px dashed rgba(0, 217, 95, 0.35)',
              borderRadius: '12px',
              cursor: 'pointer',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              <UploadCloud size={24} />
              <span>{fileName || 'Clique para selecionar foto ou documento'}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.6, color: '#ffffff' }}>PNG, JPG ou PDF (Máx. 5MB)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
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
              {isPending ? 'Enviando...' : 'Enviar Justificativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
