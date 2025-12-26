
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineItem, Quote, Customer } from '../types';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
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

export const CreateQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logo, name, address, email, phone, vat, bankName, accountName, accountNumber, branchCode, brandColor } = useWorkshop();
  const { quotes, addQuote, updateQuote, customers, addCustomer } = useData();
  const { user } = useAuth();
  
  const [isOwner] = useState(user?.role === 'Owner');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // New Customer Modal State
  const [newCust, setNewCust] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+27 ',
    address: '',
    isBusiness: false,
    companyName: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    quoteNumber: `Q-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: '',
    customerPhone: '+27 ',
    customerEmail: '',
    customerAddress: '',
    vehicle: '', 
    vehicleMake: '',
    vehicleReg: '',
    vehicleVin: '',
    vehicleOdometer: '',
    notes: '',
    internalNotes: '',
    status: 'Draft' as Quote['status']
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: Math.random().toString(), type: 'Part', description: '', qty: 1, unitPrice: 0, discount: 0, tax: 15 }
  ]);

  // Load Data Effect
  useEffect(() => {
    if (id) {
      const existingQuote = quotes.find(q => q.id === id);
      if (existingQuote) {
        setFormData({
          quoteNumber: existingQuote.number,
          date: existingQuote.date,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: existingQuote.customerName,
          customerPhone: existingQuote.customerPhone,
          customerEmail: existingQuote.customerEmail || '',
          customerAddress: existingQuote.customerAddress || '',
          vehicle: existingQuote.vehicle,
          vehicleMake: existingQuote.vehicle, 
          vehicleReg: existingQuote.regNo,
          vehicleVin: existingQuote.vin || '',
          vehicleOdometer: existingQuote.odo || '',
          notes: existingQuote.notes || '',
          internalNotes: '',
          status: existingQuote.status || 'Draft'
        });
        if (existingQuote.items) setLineItems(existingQuote.items);
      }
    }
  }, [id, quotes]);

  // Click outside listener for search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const deleteItem = (itemId: string) => {
    setLineItems(prev => prev.filter(i => i.id !== itemId));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(),
      type: 'Part',
      description: '',
      qty: 1,
      unitPrice: 0,
      discount: 0,
      tax: 15
    };
    setLineItems([...lineItems, newItem]);
  }

  const selectCustomer = (c: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: c.isBusiness && c.companyName ? `${c.companyName} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`,
      customerEmail: c.email,
      customerPhone: c.phone,
      customerAddress: c.address || ''
    }));
    setCustomerSearchQuery(c.isBusiness && c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`);
    setShowSearchResults(false);
  };

  const handleCreateCustomer = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const customerPayload: Customer = {
      id: newId,
      firstName: newCust.firstName,
      lastName: newCust.lastName,
      email: newCust.email,
      phone: newCust.phone,
      address: newCust.address,
      isBusiness: newCust.isBusiness,
      companyName: newCust.isBusiness ? newCust.companyName : undefined,
      balance: 0,
      status: 'Active'
    };
    addCustomer(customerPayload);
    selectCustomer(customerPayload);
    setShowCustomerModal(false);
    setNewCust({ firstName: '', lastName: '', email: '', phone: '+27 ', address: '', isBusiness: false, companyName: '' });
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxTotal = subtotal * 0.15;
  const total = subtotal + taxTotal;

  const handleSave = () => {
    const quotePayload: Quote = {
      id: id || Math.random().toString(36).substr(2, 9),
      number: formData.quoteNumber,
      date: formData.date,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      vehicle: formData.vehicleMake || 'Unknown Vehicle',
      regNo: formData.vehicleReg,
      vin: formData.vehicleVin,
      odo: formData.vehicleOdometer,
      amount: total,
      items: lineItems,
      notes: formData.notes,
      status: formData.status
    };

    if (id) {
      updateQuote(quotePayload);
    } else {
      addQuote(quotePayload);
    }
    navigate('/quotations');
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

    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("QUOTATION", pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text("Quote No:", pageWidth - margin - 55, 30);
    doc.text("Date:", pageWidth - margin - 55, 35);
    doc.text("Valid Until:", pageWidth - margin - 55, 40);

    doc.setFont(undefined, 'normal');
    doc.text(formData.quoteNumber, pageWidth - margin, 30, { align: 'right' });
    doc.text(formData.date, pageWidth - margin, 35, { align: 'right' });
    doc.text(formData.validUntil, pageWidth - margin, 40, { align: 'right' });

    const companyY = 40;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(name.toUpperCase(), margin, companyY);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80);
    const addressLines = doc.splitTextToSize(address || 'Address not set', 80);
    doc.text(addressLines, margin, companyY + 5);
    
    const nextY = companyY + 5 + (addressLines.length * 4);
    doc.text(`Tel: ${phone || '-'} | Email: ${email || '-'}`, margin, nextY);
    doc.text(`VAT Reg: ${vat || 'N/A'}`, margin, nextY + 4);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, 62, pageWidth - margin, 62);

    const gridY = 70;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); 
    doc.setFont(undefined, 'bold');
    doc.text("CLIENT DETAILS", margin, gridY);
    doc.line(margin, gridY + 2, 90, gridY + 2); 

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(formData.customerName || 'Cash Customer', margin, gridY + 10);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60);
    
    const custAddrLines = doc.splitTextToSize(formData.customerAddress || 'No address provided', 80);
    doc.text(custAddrLines, margin, gridY + 15);
    const telY = gridY + 15 + (custAddrLines.length * 4);
    doc.text(`Tel: ${formData.customerPhone}`, margin, telY);
    doc.text(`Email: ${formData.customerEmail}`, margin, telY + 4);

    const col2X = pageWidth / 2 + 5;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text("VEHICLE INFORMATION", col2X, gridY);
    doc.line(col2X, gridY + 2, pageWidth - margin, gridY + 2); 

    doc.setTextColor(60);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("Vehicle:", col2X, gridY + 10);
    doc.text("Registration:", col2X, gridY + 15);
    doc.text("VIN:", col2X, gridY + 20);
    doc.text("Odometer:", col2X, gridY + 25);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
    doc.text(formData.vehicleMake || 'Unknown Vehicle', col2X + 30, gridY + 10);
    doc.text(formData.vehicleReg, col2X + 30, gridY + 15);
    doc.text(formData.vehicleVin, col2X + 30, gridY + 20);
    doc.text(`${formData.vehicleOdometer} km`, col2X + 30, gridY + 25);

    const tableStartY = gridY + 35;
    autoTable(doc, {
      startY: tableStartY,
      head: [['DESCRIPTION', 'TYPE', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: lineItems.map(item => [
        item.description,
        item.type.toUpperCase(),
        item.qty,
        `R ${item.unitPrice.toFixed(2)}`,
        `R ${(item.qty * item.unitPrice).toFixed(2)}`
      ]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 4, textColor: 20, lineWidth: 0, valign: 'middle' },
      headStyles: { fillColor: [248, 250, 252], textColor: 80, fontStyle: 'bold', lineWidth: 0.1, lineColor: 220 },
      columnStyles: {
        0: { cellWidth: 'auto' }, 1: { cellWidth: 25 }, 2: { cellWidth: 20, halign: 'center' }, 
        3: { cellWidth: 35, halign: 'right' }, 4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }, 
      },
      margin: { bottom: 60 } 
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
    const footerHeight = 80; 
    const availableHeight = pageHeight - margin;
    if (finalY + footerHeight > availableHeight) { doc.addPage(); finalY = margin + 10; }

    const totalsX = pageWidth - margin - 70;
    const valueX = pageWidth - margin;
    doc.setFontSize(10); doc.setTextColor(60);
    doc.text("Subtotal", totalsX, finalY);
    doc.text(`R ${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, valueX, finalY, { align: 'right' });
    doc.text("VAT (15%)", totalsX, finalY + 6);
    doc.text(`R ${taxTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, valueX, finalY + 6, { align: 'right' });
    doc.setDrawColor(200); doc.line(totalsX, finalY + 10, pageWidth - margin, finalY + 10);
    doc.setFontSize(14); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("Total Estimate", totalsX, finalY + 18);
    doc.text(`R ${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`, valueX, finalY + 18, { align: 'right' });

    const bottomY = finalY + 30; 
    doc.setDrawColor(0); doc.setLineWidth(0.5); doc.line(margin, bottomY, pageWidth - margin, bottomY);
    const footerTextY = bottomY + 10;
    doc.setFontSize(9); doc.setTextColor(0); doc.setFont(undefined, 'bold');
    doc.text("BANKING DETAILS", margin, footerTextY);
    doc.setFont(undefined, 'normal'); doc.setTextColor(60);
    doc.text(`Bank: ${bankName}`, margin, footerTextY + 5);
    doc.text(`Account: ${accountName}`, margin, footerTextY + 9);
    doc.text(`Acc No: ${accountNumber}`, margin, footerTextY + 13);
    doc.text(`Branch: ${branchCode}`, margin, footerTextY + 17);
    doc.text(`Ref: ${formData.quoteNumber}`, margin, footerTextY + 21);

    const notesX = pageWidth / 2 + 5;
    doc.setFont(undefined, 'bold'); doc.setTextColor(0);
    doc.text("NOTES & ACCEPTANCE", notesX, footerTextY);
    doc.setFont(undefined, 'italic'); doc.setTextColor(80);
    const notesLines = doc.splitTextToSize(formData.notes || "This quote is valid for 7 days. Please sign to accept.", 85);
    doc.text(notesLines, notesX, footerTextY + 5);

    const sigY = footerTextY + 35;
    doc.setDrawColor(200); doc.setLineWidth(0.2); doc.line(notesX, sigY, pageWidth - margin, sigY);
    doc.setFont(undefined, 'bold'); doc.setFontSize(8); doc.setTextColor(0);
    doc.text("CUSTOMER SIGNATURE", notesX, sigY + 4);
    doc.text("DATE", pageWidth - margin - 10, sigY + 4, { align: 'right' });

    doc.save(`Quotation_${formData.quoteNumber}.pdf`);
  };

  const handleEmail = async () => {
    await generatePDF();
    const subject = encodeURIComponent(`Quotation ${formData.quoteNumber} - ${formData.vehicleMake || 'Vehicle Estimate'}`);
    const body = encodeURIComponent(`Dear ${formData.customerName || 'Customer'},

Please find attached the quotation ${formData.quoteNumber} for your vehicle ${formData.vehicleMake || ''}.

Total Estimate: R ${total.toLocaleString(undefined, {minimumFractionDigits: 2})}

Please review and let us know if you would like to proceed.

Best regards,
${name}`);

    setTimeout(() => {
        window.location.href = `mailto:${formData.customerEmail}?subject=${subject}&body=${body}`;
    }, 500);
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery)
  );

  return (
    <div className="px-4 md:px-10 lg:px-40 py-8 flex justify-center">
      {/* Customer Creation Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl border border-border-light overflow-hidden animate-in zoom-in duration-200">
             <div className="p-6 border-b border-border-light flex justify-between items-center bg-background-light/50">
               <h3 className="text-xl font-black text-text-main">Add New Customer</h3>
               <button onClick={() => setShowCustomerModal(false)} className="p-2 rounded-full hover:bg-slate-200 text-text-muted transition-colors">
                  <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted uppercase">First Name</span>
                        <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="text" value={newCust.firstName} onChange={e => setNewCust({...newCust, firstName: e.target.value})} />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-text-muted uppercase">Last Name</span>
                        <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="text" value={newCust.lastName} onChange={e => setNewCust({...newCust, lastName: e.target.value})} />
                    </label>
                </div>
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted uppercase">Email Address</span>
                    <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="email" value={newCust.email} onChange={e => setNewCust({...newCust, email: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted uppercase">Phone Number</span>
                    <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="tel" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted uppercase">Billing Address</span>
                    <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="text" value={newCust.address} onChange={e => setNewCust({...newCust, address: e.target.value})} />
                </label>
                <div className="flex items-center gap-2 pt-2">
                   <input type="checkbox" id="isBus" checked={newCust.isBusiness} onChange={e => setNewCust({...newCust, isBusiness: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                   <label htmlFor="isBus" className="text-sm font-bold text-text-main cursor-pointer">Register as Business</label>
                </div>
                {newCust.isBusiness && (
                  <label className="flex flex-col gap-1 animate-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-text-muted uppercase">Company Name</span>
                    <input className="h-10 px-3 rounded-lg border border-border-light bg-background-light text-sm focus:ring-primary focus:border-primary" type="text" value={newCust.companyName} onChange={e => setNewCust({...newCust, companyName: e.target.value})} />
                  </label>
                )}
             </div>
             <div className="p-6 bg-background-light/50 border-t border-border-light flex gap-3 justify-end">
                <button onClick={() => setShowCustomerModal(false)} className="px-6 py-2 rounded-lg font-bold text-sm text-text-muted hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleCreateCustomer} className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">Save & Select</button>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col max-w-[1200px] flex-1">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center text-text-muted text-sm font-medium">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-primary transition-colors">Home</a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/quotations'); }} className="hover:text-primary transition-colors">Quotations</a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-text-main">{id ? 'Edit Quotation' : 'Create New'}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">
                {id ? 'Edit Quotation' : 'New Quotation'} 
                <span className="text-text-muted font-light text-2xl md:text-3xl ml-2">#{formData.quoteNumber}</span>
              </h1>
              <p className="text-text-muted text-sm font-normal">
                {id ? `Editing existing record` : `Created on ${new Date().toLocaleDateString('en-ZA')}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={generatePDF} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-surface-card hover:bg-background-light border border-border-light text-text-main text-sm font-bold transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>PDF</span>
              </button>
              <button onClick={handleEmail} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-surface-card hover:bg-background-light border border-border-light text-primary text-sm font-bold transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Email Quote</span>
              </button>
              <button onClick={handleSave} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Customer Section */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 bg-surface-card rounded-xl p-6 border border-border-light shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">Customer Details</h3>
              </div>
              <button onClick={() => setShowCustomerModal(true)} className="text-primary text-sm font-bold hover:underline">Add New</button>
            </div>
            <div className="space-y-4">
              <div className="relative" ref={searchRef}>
                <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Search Directory</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">search</span>
                  <input 
                    className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-12 pl-12 pr-12 text-text-main placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 text-sm transition-all shadow-sm" 
                    placeholder="Search by name or phone..." 
                    type="text"
                    value={customerSearchQuery}
                    onFocus={() => setShowSearchResults(true)}
                    onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setShowSearchResults(true);
                    }}
                  />
                  {customerSearchQuery && (
                    <button 
                        onClick={() => { setCustomerSearchQuery(''); setShowSearchResults(false); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500"
                    >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && customerSearchQuery.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-border-light rounded-xl shadow-2xl z-[50] overflow-hidden max-h-[300px] overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => selectCustomer(c)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-light text-left transition-colors border-b border-border-light last:border-0"
                                >
                                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                        {c.firstName[0]}{c.lastName[0]}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-bold text-text-main truncate">{c.firstName} {c.lastName}</p>
                                        <p className="text-xs text-text-muted truncate">{c.phone} • {c.email}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-xs text-text-muted font-bold mb-2">No matching customers</p>
                                <button onClick={() => setShowCustomerModal(true)} className="text-primary text-xs font-bold underline">Create "{customerSearchQuery}" instead</button>
                            </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Customer Name</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold" type="text" value={formData.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Phone Number</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" type="tel" value={formData.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Email Address</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="client@email.com" type="email" value={formData.customerEmail} onChange={(e) => updateField('customerEmail', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Billing Address</label>
                  <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Street, Suburb, City, Postal Code" type="text" value={formData.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 bg-surface-card rounded-xl p-6 border border-border-light shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <span className="material-symbols-outlined">directions_car</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">Vehicle Details</h3>
              </div>
            </div>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Make & Model</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Toyota Hilux 2.8 GD-6" type="text" value={formData.vehicleMake} onChange={(e) => updateField('vehicleMake', e.target.value)} />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Registration No.</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold uppercase" placeholder="CA 123-456" type="text" value={formData.vehicleReg} onChange={(e) => updateField('vehicleReg', e.target.value)} />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">VIN Number</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs tracking-wide uppercase" placeholder="17 Digit VIN" type="text" value={formData.vehicleVin} onChange={(e) => updateField('vehicleVin', e.target.value)} />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Odometer (km)</label>
                   <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all text-right font-mono" placeholder="0" type="number" value={formData.vehicleOdometer} onChange={(e) => updateField('vehicleOdometer', e.target.value)} />
                </div>
              </div>
              <div className="p-4 bg-background-light rounded-xl border border-dashed border-border-light flex items-center justify-between">
                <span className="text-xs text-text-muted font-bold italic">Link vehicle history automatically to selected customer profile.</span>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="col-span-12 flex flex-col gap-4 bg-surface-card rounded-xl p-6 border border-border-light shadow-sm overflow-hidden">
             <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-text-main">Parts & Labour</h3>
              <div className="text-sm text-text-muted">Currency: <span className="text-text-main font-bold">ZAR (R)</span></div>
            </div>
             <div className="overflow-x-auto rounded-lg border border-border-light">
               <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                   <tr className="bg-background-light border-b border-border-light">
                    <th className="p-4 w-10"></th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[45%]">Description</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">Qty/Hrs</th>
                    {isOwner && <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[18%] text-right">Unit Price</th>}
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">Tax</th>
                    {isOwner && <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-[15%] text-right">Total</th>}
                    <th className="p-4 w-10"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border-light text-sm bg-surface-card">
                    {lineItems.map(item => (
                      <tr key={item.id} className="group hover:bg-background-light transition-colors">
                        <td className="p-3 text-center cursor-move text-slate-300 group-hover:text-slate-500">
                          <span className="material-symbols-outlined text-lg">drag_indicator</span>
                        </td>
                         <td className="p-3">
                          <div className="flex gap-2 items-center">
                            <select 
                              className={`px-2 py-1 rounded border text-[10px] font-bold h-fit appearance-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all ${
                                item.type === 'Part' ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                item.type === 'Labor' ? 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500' :
                                'bg-indigo-100 text-indigo-700 border-indigo-200 focus:ring-indigo-500'
                              }`}
                              value={item.type}
                              onChange={(e) => {
                                const newItems = [...lineItems];
                                const index = newItems.findIndex(i => i.id === item.id);
                                newItems[index].type = e.target.value as any;
                                setLineItems(newItems);
                              }}
                            >
                              <option value="Part">PARTS</option>
                              <option value="Labor">LABOR</option>
                              <option value="Repair">REPAIR</option>
                            </select>
                            <input className="flex-1 bg-transparent border-none p-0 text-text-main placeholder:text-text-muted focus:ring-0 font-bold" type="text" value={item.description} placeholder="Item description..." onChange={(e) => {
                                const newItems = [...lineItems];
                                const index = newItems.findIndex(i => i.id === item.id);
                                newItems[index].description = e.target.value;
                                setLineItems(newItems);
                              }} />
                          </div>
                        </td>
                        <td className="p-3">
                          <input className="w-full bg-background-light rounded-md border-transparent focus:bg-surface-card focus:border-primary py-1 px-2 text-center text-text-main focus:ring-2 focus:ring-primary/20 transition-all font-semibold" type="number" value={item.qty} onChange={(e) => {
                                const newItems = [...lineItems];
                                const index = newItems.findIndex(i => i.id === item.id);
                                newItems[index].qty = parseFloat(e.target.value) || 0;
                                setLineItems(newItems);
                          }} />
                        </td>
                        {isOwner && (
                          <td className="p-3">
                            <input className="w-full bg-background-light rounded-md border-transparent focus:bg-surface-card focus:border-primary py-1 px-2 text-right text-text-main focus:ring-2 focus:ring-primary/20 transition-all font-mono" type="number" value={item.unitPrice} onChange={(e) => {
                                  const newItems = [...lineItems];
                                  const index = newItems.findIndex(i => i.id === item.id);
                                  newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                  setLineItems(newItems);
                            }}/>
                          </td>
                        )}
                        <td className="p-3 text-center">
                          <span className="text-xs text-text-muted bg-background-light border border-border-light px-2 py-1 rounded">15%</span>
                        </td>
                        {isOwner && (
                          <td className="p-3 text-right font-mono font-bold text-text-main">
                            R {(item.qty * item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        )}
                        <td className="p-3 text-center">
                          <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
             <button onClick={addItem} className="self-start flex items-center gap-2 text-primary text-sm font-bold hover:bg-primary/5 border border-transparent hover:border-primary/20 px-4 py-2 rounded-full transition-all mt-2">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Add Line Item
            </button>
          </div>

          {/* Details & Summary Section */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
               <div className="bg-surface-card rounded-xl p-6 border border-border-light shadow-sm h-full">
                  <h3 className="text-lg font-bold text-text-main mb-4">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Issue Date</label>
                      <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" type="date" value={formData.date} onChange={(e) => updateField('date', e.target.value)} />
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Valid Until</label>
                      <input className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-full h-10 px-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all" type="date" value={formData.validUntil} onChange={(e) => updateField('validUntil', e.target.value)} />
                    </div>
                  </div>
                   <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Quotation Status</label>
                      <div className="flex gap-2">
                        {['Draft', 'Accepted', 'Rejected'].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateField('status', s)}
                            className={`flex-1 h-10 rounded-lg text-sm font-bold border transition-all ${
                              formData.status === s
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface-card text-text-muted border-border-light hover:bg-background-light'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Notes to Customer (Visible on PDF)</label>
                      <textarea className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-2xl p-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Enter terms, bank details, or specific notes for this job..." rows={3} value={formData.notes} onChange={(e) => updateField('notes', e.target.value)}></textarea>
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 ml-4 uppercase tracking-wide">Internal Notes (Private)</label>
                      <textarea className="w-full bg-background-light border border-transparent focus:bg-surface-card focus:border-primary rounded-2xl p-4 text-text-main text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Mechanic notes, parts ordering info..." rows={2} value={formData.internalNotes} onChange={(e) => updateField('internalNotes', e.target.value)}></textarea>
                    </div>
                  </div>
               </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="bg-surface-card rounded-xl p-6 border border-border-light shadow-sm h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                {isOwner ? (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-text-main mb-6 relative z-10">Financial Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center text-text-muted">
                          <span>Subtotal (Excl. VAT)</span>
                          <span className="font-mono text-text-main font-bold">R {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-text-muted">
                          <span>VAT (15%)</span>
                          <span className="font-mono text-text-main font-bold">R {taxTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                      </div>
                      <div className="h-px bg-border-light my-6"></div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-text-main font-bold text-lg">Grand Total</span>
                        <span className="text-primary font-black text-4xl font-mono tracking-tight">R {total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <p className="text-right text-xs text-text-muted">Includes all applicable taxes</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2">lock</span>
                      <p className="text-sm font-bold text-text-main">Financials Restricted</p>
                      <p className="text-xs text-text-muted mt-1 px-4">Contact the workshop owner for pricing estimates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
