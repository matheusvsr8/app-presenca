import crypto from 'crypto';

const SECRET = process.env.QR_SECRET || 'logqr-daily-secret-token-key-2026';

/**
 * Gera a string da data no formato YYYY-MM-DD no fuso de Brasília (ou UTC).
 */
export function getTodayDateString(): string {
  const now = new Date();
  // Formato YYYY-MM-DD no fuso brasileiro (America/Sao_Paulo)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Gera o payload seguro e diário para o QR Code do aluno.
 */
export function generateDailyQrCode(studentId: string, dateStr = getTodayDateString()): string {
  const data = `${studentId}:${dateStr}:${SECRET}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  return `LOGQR:${studentId}:${dateStr}:${hash}`;
}

/**
 * Valida o payload escaneado. Retorna o studentId se for válido e do dia de hoje, ou lança erro.
 */
export function verifyDailyQrCode(payload: string, expectedDate = getTodayDateString()): { studentId: string; isValid: boolean; error?: string } {
  if (!payload) {
    return { studentId: '', isValid: false, error: 'Código vazio.' };
  }

  // Se for o novo formato seguro diário
  if (payload.startsWith('LOGQR:')) {
    const parts = payload.split(':');
    if (parts.length !== 4) {
      return { studentId: '', isValid: false, error: 'Formato de QR Code inválido.' };
    }

    const [, studentId, dateStr, hash] = parts;

    // 1. Checa a assinatura
    const expectedData = `${studentId}:${dateStr}:${SECRET}`;
    const expectedHash = crypto.createHash('sha256').update(expectedData).digest('hex').substring(0, 16);

    if (hash !== expectedHash) {
      return { studentId: '', isValid: false, error: 'Assinatura do QR Code inválida ou falsificada.' };
    }

    // 2. Checa se o QR code é da data de hoje
    if (dateStr !== expectedDate) {
      return { 
        studentId: '', 
        isValid: false, 
        error: `QR Code expirado! Este código era válido apenas para o dia ${dateStr.split('-').reverse().join('/')}.` 
      };
    }

    return { studentId, isValid: true };
  }

  // Compatibilidade com QR code legado (UUID estático)
  return { studentId: payload, isValid: true };
}
