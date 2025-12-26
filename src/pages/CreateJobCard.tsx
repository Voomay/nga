
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';
import { JobCard } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JobTask {
  id: string;
  description: string;
  completed: boolean;
}

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

export const CreateJobCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logo, name, address, phone, brandColor } = useWorkshop();
  const { jobCards, addJobCard, updateJobCard, technicians } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [tasks, setTasks] = useState<JobTask[]>([
    { id: Math.random().toString(), description: 'Vehicle Inspection', completed: false },
  ]);

  const [formData, setFormData] = useState({
    jobId: `JC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleReg: '',
    vehicleMake: '',
    vehicleVin: '',
    vehicleOdometer: '',
    fuelLevel: '1/2 Tank',
    fuelType: 'Petrol' as JobCard['fuelType'],
    customerRequest: '',
    technician: 'Unassigned',
    estCompletion: '',
    priority: 'Normal',
    jobType: 'Service',
    status: 'Booked'
  });

  useEffect(() => {
    if (id) {
      const existingJob = jobCards.find(j => j.id === id);
      if (existingJob) {
        setFormData({
          jobId: existingJob.jobId,
          customerName: existingJob.customerName,
          customerPhone: existingJob.customerPhone,
          customerEmail: existingJob.customerEmail || '',
          vehicleReg: existingJob.vehicleReg,
          vehicleMake: existingJob.vehicleName,
          vehicleVin: existingJob.vehicleVin || '',
          vehicleOdometer: existingJob.vehicleOdometer || '',
          fuelLevel: existingJob.fuelLevel || '1/2 Tank',
          fuelType: existingJob.fuelType || 'Petrol',
          customerRequest: existingJob.customerRequest || '',
          technician: existingJob.technicianName,
          estCompletion: existingJob.estCompletion || '',
          priority: existingJob.priority || 'Normal',
          jobType: existingJob.jobType || 'Service',
          status: existingJob.status
        });
        if (existingJob.tasks) setTasks(existingJob.tasks);
        if (existingJob.images) setImages(existingJob.images);
      }
    }
  }, [id, jobCards]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTask = () => {
    const newTask = { id: Math.random().toString(), description: '', completed: false };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, text: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, description: text } : t));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = () => {
    const jobPayload: JobCard = {
      id: id || Math.random().toString(36).substr(2, 9),
      jobId: formData.jobId,
      vehicleReg: formData.vehicleReg,
      vehicleName: formData.vehicleMake,
      vehicleVin: formData.vehicleVin,
      vehicleOdometer: formData.vehicleOdometer,
      fuelLevel: formData.fuelLevel,
      fuelType: formData.fuelType,
      customerInitials: formData.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      technicianName: formData.technician,
      technicianAvatar: '', 
      status: formData.status as any,
      progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
      statusText: `${tasks.filter(t => t.completed).length}/${tasks.length} Tasks`,
      statusColor: formData.status === 'Completed' ? 'emerald' : formData.status === 'Waiting Parts' ? 'amber' : formData.status === 'In Progress' ? 'blue' : 'slate',
      priority: formData.priority,
      jobType: formData.jobType,
      estCompletion: formData.estCompletion,
      customerRequest: formData.customerRequest,
      tasks: tasks,
      images: images
    };

    if (id) {
      updateJobCard(jobPayload);
    } else {
      addJobCard(jobPayload);
    }
    navigate('/job-cards');
  };

  const generatePDF = async () => {
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
    doc.text(`Job No: ${formData.jobId}`, pageWidth - margin, 26, { align: 'right' });
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
    
    doc.text(`Name: ${formData.customerName}`, margin, startY + 8);
    doc.text(`Phone: ${formData.customerPhone}`, margin, startY + 13);
    doc.text(`Email: ${formData.customerEmail}`, margin, startY + 18);

    const rightX = pageWidth / 2 + 5;
    doc.text(`Vehicle: ${formData.vehicleMake}`, rightX, startY + 8);
    doc.text(`Reg No: ${formData.vehicleReg}`, rightX, startY + 13);
    doc.text(`VIN: ${formData.vehicleVin}`, rightX, startY + 18);
    doc.text(`Fuel: ${formData.fuelLevel} (${formData.fuelType})`, rightX, startY + 23);
    doc.text(`Odometer: ${formData.vehicleOdometer} km`, rightX, startY + 28);

    const reqY = startY + 35;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, reqY, pageWidth - (margin*2), 25, 1, 1, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Customer Request / Fault Report:", margin + 4, reqY + 6);
    doc.setFontSize(10);
    doc.setTextColor(60);
    const splitReq = doc.splitTextToSize(formData.customerRequest || "No specific request.", pageWidth - (margin*2) - 8);
    doc.text(splitReq, margin + 4, reqY + 13);

    const tableY = reqY + 35;
    
    autoTable(doc, {
      startY: tableY,
      head: [['Done', 'Task Description', 'Technician Notes']],
      body: tasks.map(t => [
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

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 15;

    // --- IMAGES SECTION (4-COLUMN GRID) ---
    if (images.length > 0) {
      const cols = 4;
      const horizontalGap = 2;
      const verticalGap = 2;
      const availableWidth = pageWidth - (margin * 2);
      const imgSize = (availableWidth - ((cols - 1) * horizontalGap)) / cols;

      // Check if title fits
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
      for (let i = 0; i < images.length; i++) {
        const col = i % cols;
        // If we are at a new row, check if the whole row fits
        if (col === 0 && i > 0) {
          if (currentY + imgSize + verticalGap + imgSize > pageHeight - 15) {
            doc.addPage();
            currentY = margin + 5;
          } else {
            currentY += imgSize + verticalGap;
          }
        } else if (i === 0) {
           // check if first row fits
           if (currentY + imgSize > pageHeight - 15) {
             doc.addPage();
             currentY = margin + 5;
           }
        }

        const xPos = margin + (col * (imgSize + horizontalGap));
        try {
          const imgProps = await getImageProperties(images[i]);
          if (imgProps) {
            doc.addImage(imgProps.data, 'JPEG', xPos, currentY, imgSize, imgSize, undefined, 'FAST');
          }
        } catch (e) { console.error(e); }
        
        // Track the end of the image block accurately
        if (i === images.length - 1) {
            finalY = currentY + imgSize + 15;
        }
      }
    }

    // Ensure space for signatures
    const sigBlockHeight = 40;
    if (finalY + sigBlockHeight > pageHeight - margin) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(0);
    
    doc.text("Technician Signature:", margin, finalY);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, finalY + 12, 80, finalY + 12);
    doc.text(formData.technician, margin, finalY + 17);

    const custSigX = pageWidth / 2 + 5;
    doc.text("Customer Acceptance:", custSigX, finalY);
    doc.line(custSigX, finalY + 12, pageWidth - margin, finalY + 12);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("I authorize the work listed above.", custSigX, finalY + 17);

    doc.save(`JobCard_${formData.jobId}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full pb-20">
      <div className="flex flex-wrap gap-2 py-4 mb-4">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="text-text-muted text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
        <span className="text-text-muted text-sm font-medium">/</span>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/job-cards'); }} className="text-text-muted text-sm font-medium hover:text-primary transition-colors cursor-pointer">Job Cards</a>
        <span className="text-text-muted text-sm font-medium">/</span>
        <span className="text-text-main text-sm font-medium">{id ? 'Edit Job Card' : 'Create New'}</span>
      </div>

      <div className="flex flex-col gap-6 mb-8">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
               <h1 className="text-text-main text-3xl md:text-4xl font-black tracking-tight">{id ? `Job Card ${formData.jobId}` : 'New Job Card'}</h1>
               <p className="text-text-muted text-base font-normal">Manage vehicle repairs, tasks, and documentation.</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={generatePDF}
                className="px-4 h-12 rounded-full border border-border-light bg-surface-card text-text-main font-bold text-sm hover:bg-background-light transition-colors flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[20px]">download</span>
                 Download PDF
               </button>
               <button 
                onClick={handleSave}
                className="px-6 h-12 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg transition-colors flex items-center gap-2"
               >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Changes
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                     <span className="material-symbols-outlined">person</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-main">Customer Details</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Customer Name</label>
                     <div className="relative">
                        <input 
                          className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light bg-background-light focus:bg-surface-card focus:ring-primary transition-all text-text-main" 
                          placeholder="Search customer..." 
                          value={formData.customerName}
                          onChange={(e) => updateField('customerName', e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3.5 text-text-muted">search</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Phone Number</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main" 
                      placeholder="+27" 
                      value={formData.customerPhone}
                      onChange={(e) => updateField('customerPhone', e.target.value)}
                     />
                  </div>
                   <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Email Address</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main" 
                      placeholder="email@address.com" 
                      value={formData.customerEmail}
                      onChange={(e) => updateField('customerEmail', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
                     <span className="material-symbols-outlined">directions_car</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-main">Vehicle Details</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Registration No.</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main font-bold uppercase font-mono" 
                      placeholder="CA 123-456" 
                      value={formData.vehicleReg}
                      onChange={(e) => updateField('vehicleReg', e.target.value)}
                     />
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Make & Model</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main" 
                      placeholder="e.g. Ford Ranger 2.2 XL" 
                      value={formData.vehicleMake}
                      onChange={(e) => updateField('vehicleMake', e.target.value)}
                     />
                  </div>
                  <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Fuel Type</label>
                     <select 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main cursor-pointer"
                      value={formData.fuelType}
                      onChange={(e) => updateField('fuelType', e.target.value)}
                     >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                     </select>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">VIN Number</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main uppercase text-sm font-mono" 
                      placeholder="17 Digit VIN" 
                      value={formData.vehicleVin}
                      onChange={(e) => updateField('vehicleVin', e.target.value)}
                     />
                  </div>
                   <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Odometer (km)</label>
                     <input 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main text-right font-mono" 
                      type="text" 
                      placeholder="0" 
                      value={formData.vehicleOdometer}
                      onChange={(e) => updateField('vehicleOdometer', e.target.value)}
                     />
                  </div>
                  <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Fuel Level</label>
                     <select 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main cursor-pointer"
                      value={formData.fuelLevel}
                      onChange={(e) => updateField('fuelLevel', e.target.value)}
                     >
                        <option>1/4 Tank</option>
                        <option>1/2 Tank</option>
                        <option>3/4 Tank</option>
                        <option>Full Tank</option>
                        <option>Empty</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                        <span className="material-symbols-outlined">checklist</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-main">Job Tasks & Checks</h3>
                  </div>
                  <button onClick={addTask} className="text-sm font-bold text-primary hover:underline">+ Add Item</button>
               </div>
               <div className="flex flex-col gap-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-light border border-transparent hover:border-border-light group">
                       <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                       />
                       <input 
                        type="text" 
                        value={task.description}
                        onChange={(e) => updateTask(task.id, e.target.value)}
                        className={`flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 ${task.completed ? 'line-through text-text-muted' : 'text-text-main'}`}
                        placeholder="Describe task..."
                       />
                       <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-600">
                        <span className="material-symbols-outlined">perm_media</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-main">Job Photos</h3>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background-light hover:bg-border-light text-text-main text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    Upload Photo
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
               </div>
               
               {images.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-light rounded-xl bg-background-light/50">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">image</span>
                    <p className="text-sm text-text-muted">No photos added yet</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border-light bg-background-light">
                        <img src={img} alt={`Job photo ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => removeImage(idx)} className="p-2 bg-white/20 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm sticky top-6">
               <h3 className="text-lg font-bold text-text-main mb-6 pb-2 border-b border-border-light">Job Configuration</h3>
               <div className="flex flex-col gap-6">
                  <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Job Status</label>
                     <select 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main font-bold"
                      value={formData.status}
                      onChange={(e) => updateField('status', e.target.value)}
                     >
                        <option>Booked</option>
                        <option>In Progress</option>
                        <option>Waiting Parts</option>
                        <option>Completed</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Assign Technician</label>
                     <select 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main"
                      value={formData.technician}
                      onChange={(e) => updateField('technician', e.target.value)}
                     >
                        <option value="Unassigned">Unassigned</option>
                        {technicians.map(tech => (
                            <option key={tech.id} value={tech.name}>{tech.name} {tech.role ? `(${tech.role})` : ''}</option>
                        ))}
                     </select>
                  </div>
                   <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Estimated Completion</label>
                     <input 
                      type="datetime-local" 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main"
                      value={formData.estCompletion}
                      onChange={(e) => updateField('estCompletion', e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Priority</label>
                     <div className="flex gap-2">
                        {['Normal', 'High', 'Urgent'].map(p => (
                          <label key={p} className="flex-1 cursor-pointer">
                             <input 
                              type="radio" 
                              name="priority" 
                              className="peer sr-only" 
                              checked={formData.priority === p}
                              onChange={() => updateField('priority', p)}
                             />
                             <div className={`h-10 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${
                               formData.priority === p 
                               ? (p === 'Normal' ? 'bg-green-100 text-green-700 border-green-200' : p === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200')
                               : 'border-border-light bg-surface-card text-text-muted hover:bg-background-light'
                             }`}>
                               {p}
                             </div>
                          </label>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-text-muted mb-1 ml-1 uppercase tracking-wide">Job Type</label>
                     <select 
                      className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary transition-all text-text-main"
                      value={formData.jobType}
                      onChange={(e) => updateField('jobType', e.target.value)}
                     >
                        <option>Service</option>
                        <option>Repair</option>
                        <option>Inspection</option>
                        <option>Warranty Work</option>
                        <option>Comeback</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
