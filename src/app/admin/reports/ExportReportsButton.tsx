'use client';

import { FileSpreadsheet, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CourseReportData {
  id: string;
  name: string;
  enrolledStudentsCount: number;
  totalSessionsCount: number;
  totalAttendancesCount: number;
  presenceRate: number;
}

interface StudentReportItem {
  name: string;
  email: string;
  courseName: string;
  totalSessions: number;
  attendancesCount: number;
  absencesCount: number;
  presenceRate: number;
  status: 'REGULAR' | 'ATENCAO' | 'EM_RISCO';
}

interface ExportReportsButtonProps {
  coursesData: CourseReportData[];
  studentsData: StudentReportItem[];
}

export default function ExportReportsButton({
  coursesData,
  studentsData,
}: ExportReportsButtonProps) {
  // Exportar para CSV (Excel / Planilhas)
  const exportToCsv = () => {
    try {
      const headers = [
        'Nome do Aluno',
        'E-mail',
        'Turma',
        'Aulas Totais',
        'Presencas',
        'Faltas',
        'Taxa de Presenca (%)',
        'Status Frequencia'
      ];

      const rows = studentsData.map(s => [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email.replace(/"/g, '""')}"`,
        `"${s.courseName.replace(/"/g, '""')}"`,
        s.totalSessions,
        s.attendancesCount,
        s.absencesCount,
        `${s.presenceRate}%`,
        s.status === 'EM_RISCO' ? 'EM RISCO (<75%)' : s.status === 'ATENCAO' ? 'ATENCAO (75-84%)' : 'REGULAR (>=85%)'
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_frequencia_logqr_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Planilha CSV exportada com sucesso!');
    } catch (e) {
      toast.error('Erro ao gerar planilha CSV.');
    }
  };

  // Acionar Impressão / Salvar PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={exportToCsv}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 217, 95, 0.15)',
          border: '1px solid rgba(0, 217, 95, 0.35)',
          color: 'var(--primary)',
          borderRadius: '10px',
          padding: '0.55rem 0.95rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0, 217, 95, 0.2)',
          transition: 'all 0.15s'
        }}
      >
        <FileSpreadsheet size={16} />
        Baixar Planilha (CSV)
      </button>

      <button
        onClick={handlePrint}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '0.55rem 0.95rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
      >
        <Printer size={16} />
        Imprimir / Gerar PDF
      </button>
    </div>
  );
}
