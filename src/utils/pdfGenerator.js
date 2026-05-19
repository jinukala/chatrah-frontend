import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const SCHOOL_NAME = 'Chatrah School';
const SCHOOL_SUB = 'School Management System';

function addHeader(doc) {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, 105, 20, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(SCHOOL_SUB, 105, 27, { align: 'center' });
  doc.setDrawColor(123, 17, 19);
  doc.setLineWidth(0.5);
  doc.line(15, 30, 195, 30);
  return 35;
}

export function downloadResultsPDF(result, studentName) {
  const doc = new jsPDF();
  let y = addHeader(doc);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAMINATION RESULT', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${studentName}`, 15, y);
  doc.text(`Exam: ${result.examName}`, 120, y);
  y += 7;

  const subjects = result.subjects || [];
  const tableData = subjects.map(s => {
    const pct = ((s.marks / s.maxMarks) * 100);
    const grade = pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : pct >= 41 ? 'C2' : pct >= 35 ? 'D' : 'E';
    return [s.subject, s.marks, s.maxMarks, `${pct.toFixed(0)}%`, grade, pct >= 35 ? 'Pass' : 'Fail'];
  });

  doc.autoTable({
    startY: y,
    head: [['Subject', 'Marks', 'Max', '%', 'Grade', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [123, 17, 19] },
    styles: { fontSize: 9 },
  });

  y = doc.lastAutoTable.finalY + 10;
  const totalPct = result.totalMaxMarks > 0 ? (result.totalMarksObtained / result.totalMaxMarks) * 100 : 0;
  const cgpa = subjects.length > 0 ? (subjects.reduce((sum, s) => {
    const p = (s.marks / s.maxMarks) * 100;
    return sum + (p >= 91 ? 10 : p >= 81 ? 9 : p >= 71 ? 8 : p >= 61 ? 7 : p >= 51 ? 6 : p >= 41 ? 5 : p >= 35 ? 4 : 0);
  }, 0) / subjects.length).toFixed(2) : '0';
  const passed = subjects.every(s => (s.marks / s.maxMarks) * 100 >= 35);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${result.totalMarksObtained}/${result.totalMaxMarks}  |  Percentage: ${totalPct.toFixed(1)}%  |  CGPA: ${cgpa}  |  Result: ${passed ? 'PASS' : 'FAIL'}`, 15, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document. Managed by CHATRAH.', 105, 285, { align: 'center' });

  doc.save(`Result_${studentName.replace(/\s+/g, '_')}_${result.examName.replace(/\s+/g, '_')}.pdf`);
}

export function downloadFeeReceiptPDF(summary, studentName) {
  const doc = new jsPDF();
  let y = addHeader(doc);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE PAYMENT RECEIPT', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${studentName}`, 15, y);
  if (summary.className) doc.text(`Class: ${summary.className} - ${summary.section}`, 120, y);
  y += 10;

  // Summary
  doc.autoTable({
    startY: y,
    head: [['Description', 'Amount (₹)']],
    body: [
      ['Total Fee', summary.totalFee?.toLocaleString()],
      ['Total Paid', summary.totalPaid?.toLocaleString()],
      ['Due Amount', summary.due?.toLocaleString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [123, 17, 19] },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' } },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Payment history
  if (summary.payments?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Payment History', 15, y);
    y += 5;

    doc.autoTable({
      startY: y,
      head: [['Date', 'Amount (₹)', 'Mode', 'Receipt No']],
      body: summary.payments.map(p => [
        p.paidOn?.split('T')[0] || '—',
        p.amount?.toLocaleString(),
        p.mode || '—',
        p.receiptNo || '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [123, 17, 19] },
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
    });
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document. Managed by CHATRAH.', 105, 285, { align: 'center' });

  doc.save(`Fee_Receipt_${studentName.replace(/\s+/g, '_')}.pdf`);
}
