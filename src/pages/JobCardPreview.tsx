
import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] 
    : [13, 81, 176];
};

// Helper to load image for PDF and get dimensions
interface ImageResult {
  data: string;
  width: number;
  height: number;
}

const getImageProperties = (url: string): Promise<ImageResult | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve({ data: dataURL, width: img.width, height: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const JobCardPreview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { logo, name, address, phone, email, brandColor } = useWorkshop();
  const { jobCards } = useData();
  
  const job = jobCards.find(j => j.id === id);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!job) return;

    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const primaryColor = hexToRgb(brandColor); 

    if (logo) {
      try {
        const logoImg = await getImageProperties(logo);
        if (logoImg) {
            const maxLogoWidth = 35; 
            const maxLogoHeight = 18;
            const ratio = logoImg.width / logoImg.height;
            let pdfLogoWidth = maxLogoWidth;
            let pdfLogoHeight = pdfLogoWidth / ratio;
            if (pdfLogoHeight > maxLogoHeight) {
                pdfLogoHeight = maxLogoHeight;
                pdfLogoWidth = pdfLogoHeight * ratio;
            }
            doc.addImage(logoImg.data, 'PNG', margin, 10, pdfLogoWidth, pdfLogoHeight, undefined, 'FAST');
        }
      } catch (e) { console.error(e); }
    }

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("JOB CARD", pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Job No: ${job.jobId}`, pageWidth - margin, 26, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 31, { align: 'right' });

    const companyY = 35;
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(name, margin, companyY);
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    
    const addressLines = doc.splitTextToSize(address || 'Address not set', 120);
    doc.text(addressLines, margin, companyY + 5);
    doc.text(`Tel: ${phone || '-'}`, margin, companyY + 5 + (addressLines.length * 4));

    doc.setDrawColor(220);
    doc.line(margin, 48, pageWidth - margin, 48);

    const startY = 55;
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Customer Details", margin, startY);
    doc.text("Vehicle Details", pageWidth / 2 + 5, startY);

    doc.setFontSize(10);
    doc.setTextColor(0);
    
    doc.text(`Name: ${job.customerName}`, margin, startY + 8);
    doc.text(`Phone: ${job.customerPhone}`, margin, startY + 13);
    doc.text(`Email: ${job.customerEmail || '-'}`, margin, startY + 18);

    const rightX = pageWidth / 2 + 5;
    doc.text(`Vehicle: ${job.vehicleName}`, rightX, startY + 8);
    doc.text(`Reg No: ${job.vehicleReg}`, rightX, startY + 13);
    doc.text(`VIN: ${job.vehicleVin || '-'}`, rightX, startY + 18);
    doc.text(`Fuel: ${job.fuelLevel || '-'} (${job.fuelType || 'N/A'})`, rightX, startY + 23);
    doc.text(`Odometer: ${job.vehicleOdometer || '-'} km`, rightX, startY + 28);

    const reqY = startY + 35;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, reqY, pageWidth - (margin*2), 25, 1, 1, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Customer Request / Fault Report:", margin + 4, reqY + 6);
    doc.setFontSize(10);
    doc.setTextColor(60);
    const splitReq = doc.splitTextToSize(job.customerRequest || "No specific request.", pageWidth - (margin*2) - 8);
    doc.text(splitReq, margin + 4, reqY + 13);

    const tableY = reqY + 35;
    
    if (job.tasks && job.tasks.length > 0) {
      autoTable(doc, {
        startY: tableY,
        head: [['Done', 'Task Description', 'Technician Notes']],
        body: job.tasks.map(t => [
          t.completed ? 'YES' : 'NO',
          t.description,
          ''
        ]),
        styles: { fontSize: 10, cellPadding: 3, textColor: 20 },
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 60 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { bottom: 60 }
      });
    }

    // @ts-ignore
    let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : tableY) + 15;

    // --- IMAGES SECTION (4-COLUMN GRID) ---
    if (job.images && job.images.length > 0) {
      const cols = 4;
      const horizontalGap = 2;
      const verticalGap = 2;
      const availableWidth = pageWidth - (margin * 2);
      const imgSize = (availableWidth - ((cols - 1) * horizontalGap)) / cols;

      if (finalY + 20 > pageHeight - 15) {
        doc.addPage();
        finalY = margin + 5;
      }

      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont(undefined, 'bold');
      doc.text("INSPECTION PHOTOS", margin, finalY);
      finalY += 8;

      let currentY = finalY;
      for (let i = 0; i < job.images.length; i++) {
        const col = i % cols;
        if (col === 0 && i > 0) {
          if (currentY + imgSize + verticalGap + imgSize > pageHeight - 15) {
            doc.addPage();
            currentY = margin + 5;
          } else {
            currentY += imgSize + verticalGap;
          }
        } else if (i === 0) {
           if (currentY + imgSize > pageHeight - 15) {
             doc.addPage();
             currentY = margin + 5;
           }
        }

        const xPos = margin + (col * (imgSize + horizontalGap));
        try {
          const imgProps = await getImageProperties(job.images[i]);
          if (imgProps) {
            doc.addImage(imgProps.data, 'JPEG', xPos, currentY, imgSize, imgSize, undefined, 'FAST');
          }
        } catch (e) { console.error("PDF Image Error", e); }
        
        if (i === job.images.length - 1) {
            finalY = currentY + imgSize + 15;
        }
      }
    }

    const footerHeight = 40;
    const availableHeight = pageHeight - margin;
    if (finalY + footerHeight > availableHeight) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(0);
    
    doc.text("Technician Signature:", margin, finalY);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, finalY + 12, 80, finalY + 12);
    doc.text(job.technicianName, margin, finalY + 17);

    const custSigX = pageWidth / 2 + 5;
    doc.text("Customer Acceptance:", custSigX, finalY);
    doc.line(custSigX, finalY + 12, pageWidth - margin, finalY + 12);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("I authorize the work listed above.", custSigX, finalY + 17);

    doc.save(`JobCard_${job.jobId}.pdf`);
  };

  if (!job) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-text-muted">Job Card not found.</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/job-cards'); }} className="hover:text-primary transition-colors">Job Cards</a>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-text-main font-medium">{job.jobId}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-main">Job Card Preview</h1>
        </div>
        <div className="flex gap-3">
            <button onClick={() => navigate(`/job-cards/${id}`)} className="px-4 py-2 bg-surface-card border border-border-light text-text-main rounded-lg hover:bg-background-light transition-colors text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-surface-card border border-border-light text-text-main rounded-lg hover:bg-background-light transition-colors text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">print</span> Print
            </button>
            <button onClick={handleDownloadPDF} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-bold flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span> Download PDF
            </button>
        </div>
      </div>

      <div className="bg-white text-slate-900 rounded-none md:rounded-xl shadow-lg border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0 print:w-full overflow-hidden max-w-[210mm] mx-auto min-h-[297mm]">
        <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-8">
            <div className="flex flex-col gap-4">
                <img src={logo} alt="Logo" className="h-16 w-auto object-contain self-start" />
                <div className="text-sm text-slate-600">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{name}</h2>
                    <p className="whitespace-pre-wrap">{address}</p>
                    <p className="mt-1">Tel: {phone} | Email: {email}</p>
                </div>
            </div>
            <div className="text-right">
                <h1 className="text-3xl font-bold text-primary mb-2">JOB CARD</h1>
                <div className="text-sm text-slate-600">
                    <p>Job No: <span className="font-bold text-slate-900">{job.jobId}</span></p>
                    <p>Date: <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span></p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Details</h3>
                <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="font-bold text-slate-900">{job.customerName}</span></p>
                    <p>Phone: {job.customerPhone}</p>
                    <p>Email: {job.customerEmail || 'N/A'}</p>
                </div>
            </div>
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle Details</h3>
                <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="font-bold text-slate-900">{job.vehicleName}</span></p>
                    <p>Reg: <span className="font-mono bg-slate-100 px-1 rounded">{job.vehicleReg}</span></p>
                    <p>VIN: <span className="font-mono text-xs">{job.vehicleVin || 'N/A'}</span></p>
                    <p>Fuel: {job.fuelLevel} ({job.fuelType || 'N/A'})</p>
                </div>
            </div>
        </div>

        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Request</h3>
            <p className="text-sm text-slate-800 italic">{job.customerRequest || "No instructions."}</p>
        </div>

        <div className="mb-12">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">checklist</span> Job Tasks & Checks
            </h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                        <th className="p-3 border-b border-slate-200 w-16 text-center">Done</th>
                        <th className="p-3 border-b border-slate-200">Description</th>
                        <th className="p-3 border-b border-slate-200 w-1/3">Notes</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {job.tasks?.map((task, i) => (
                        <tr key={i} className="border-b border-slate-100">
                            <td className="p-3 text-center">
                                <div className={`w-5 h-5 border-2 rounded mx-auto ${task.completed ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}>
                                    {task.completed && <span className="material-symbols-outlined text-[16px] block">check</span>}
                                </div>
                            </td>
                            <td className="p-3 text-slate-800 font-medium">{task.description}</td>
                            <td className="p-3 border-l border-slate-100 bg-slate-50/50"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {job.images && job.images.length > 0 && (
           <div className="mb-12">
              <h3 className="text-lg font-black text-primary mb-6 uppercase tracking-tight">Inspection Photos</h3>
              <div className="grid grid-cols-4 gap-2">
                {job.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded border border-slate-200 bg-slate-50 overflow-hidden">
                    <img src={img} alt={`Inspection ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
           </div>
        )}

        <div className="mt-auto pt-12 grid grid-cols-2 gap-12 break-inside-avoid">
            <div>
                <div className="h-px bg-slate-300 mb-2"></div>
                <p className="text-xs font-bold text-slate-500 uppercase">Technician Signature</p>
                <p className="text-sm text-slate-900 mt-1">{job.technicianName}</p>
            </div>
            <div>
                <div className="h-px bg-slate-300 mb-2"></div>
                <p className="text-xs font-bold text-slate-500 uppercase">Customer Acceptance</p>
                <p className="text-[10px] text-slate-400 mt-1">I hereby authorize the above work.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
