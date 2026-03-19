// src/app/pages/admin/reports/ReportPDF.tsx
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ReportStats, ReportChartData } from './utils/reportUtils';
import { TreeData } from '../../../utils/storage';

export const generatePDF = async (
  municipality: string,
  timestamp: Date,
  stats: ReportStats,
  chartData: ReportChartData,
  trees: TreeData[]
): Promise<boolean> => {
  const reportElement = document.getElementById('report-to-print');
  if (!reportElement) return false;

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // STRATEGY: Inject a global style to kill oklch before html2canvas parses the tree
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            /* Force all colors to standard RGB fallbacks */
            color: #1e293b !important; 
            border-color: #e2e8f0 !important;
            background-color: transparent !important;
          }
          #report-to-print, .bg-white {
            background-color: #ffffff !important;
          }
          /* Ensure charts/SVGs don't use oklch fills */
          svg *, circle, path, rect {
            fill: #15803d !important;
            stroke: #15803d !important;
          }
          .text-green-700 { color: #15803d !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeightMm = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = imgHeightMm;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMm);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMm);
      heightLeft -= pageHeight;
    }

    const dateStr = timestamp instanceof Date ? timestamp.toISOString().split('T')[0] : 'Report';
    pdf.save(`${municipality.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    return true;
  } catch (error) {
    console.error("Critical PDF Error:", error);
    return false;
  }
};