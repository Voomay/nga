
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Invoice, Customer } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  id: string;
  description: string;
  type: 'Part' | 'Labor' | 'Repair';
  qty: number;
  unitPrice: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] 
    : [13, 81, 176];
};

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

export const CreateInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logo, name, address, phone, email, vat, bankName, accountName, accountNumber, branchCode, brandColor } = useWorkshop();
  const { invoices, addInvoice, updateInvoice, customers, addCustomer } = useData();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const isOwner = user?.role === 'Owner';

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
  
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerVat: '',
    vehicleReg: '',
    vehicleMake: '',
    subtotal: 0,
    vat: 0,
    total: 0,
    balance: 0,
    amountPaid: 0,
    paymentMethod: 'EFT',
    status: 'Outstanding' as Invoice['status']
  });

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { id: Math.random().toString(), description: '', type: 'Part', qty: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const sub = lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const tax = sub * 0.15;
    const tot = sub + tax;
    const bal = tot - formData.amountPaid;

    setFormData(prev => {
        let suggestedStatus = prev.status;
        if (bal <= 0) suggestedStatus = 'Paid';
        else if (prev.amountPaid > 0) suggestedStatus = 'Partial';
        
        return {
            ...prev,
            subtotal: sub,
            vat: tax,
            total: tot,
            balance: bal,
            status: suggestedStatus
        }
    });
  }, [lineItems, formData.amountPaid]);

  useEffect(() => {
    if (id) {
      const existing = invoices.find(i => i.id === id);
      if (existing) {
        setFormData(prev => ({
          ...prev,
          invoiceNumber: existing.number,
          date: existing.date,
          customerName: existing.customerName,
          vehicleReg: existing.vehicleReg,
          vehicleMake: existing.vehicleMake,
          amountPaid: existing.paidAmount,
          status: existing.status
        }));
        
        if (existing.items && existing.items.length > 0) {
            setLineItems(existing.items.map(i => ({...i, type: i.type as 'Part' | 'Labor' | 'Repair'})));
        }
      }
    }
  }, [id, invoices]);

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

  const selectCustomer = (c: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: c.isBusiness && c.companyName ? `${c.companyName} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`,
      customerEmail: c.email,
      customerPhone: c.phone,
      customerAddress: c.address || '',
      customerVat: c.vatNumber || ''
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      description: '',
      type: 'Part',
      qty: 1,
      unitPrice: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeItem = (id: string) => {
    setLineItems(items => items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) return { ...item, [field]: value };
      return item;
    }));
  };

  const handleSave = () => {
    const inv: Invoice = {
        id: id || Math.random().toString(36).substr(2, 9),
        number: formData.invoiceNumber,
        date: formData.date,
        customerName: formData.customerName,
        vehicleReg: formData.vehicleReg,
        vehicleMake: formData.vehicleMake,
        amount: formData.total,
        balance: formData.balance,
        paidAmount: formData.amountPaid,
        status: formData.status,
        items: lineItems
    };

    if (id) {
        updateInvoice(inv);
    } else {
        addInvoice(inv);
    }
    navigate('/invoices');
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
    doc.text("TAX INVOICE", pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text("Invoice No:", pageWidth - margin - 55, 30);
    doc.text("Date:", pageWidth - margin - 55, 35);
    doc.text("Due Date:", pageWidth - margin - 55, 40);

    doc.setFont(undefined, 'normal');
    doc.text(formData.invoiceNumber, pageWidth - margin, 30, { align: 'right' });
    doc.text(formData.date, pageWidth - margin, 35, { align: 'right' });
    doc.text("On Receipt", pageWidth - margin, 40, { align: 'right' });

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
    doc.text(`Tel: ${phone || '-'}`, margin, nextY);
    doc.text(`VAT Reg: ${vat || 'N/A'}`, margin, nextY + 4);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, 62, pageWidth - margin, 62);

    const startY = 70;
    const col2X = pageWidth / 2 + 5;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text("BILL TO", margin, startY);
    doc.line(margin, startY + 2, 90, startY + 2);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(formData.customerName || 'Cash Customer', margin, startY + 10);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60);
    const custAddrLines = doc.splitTextToSize(formData.customerAddress || 'No address provided', 80);
    doc.text(custAddrLines, margin, startY + 15);
    
    const custContactY = startY + 15 + (custAddrLines.length * 4);
    doc.text(`Tel: ${formData.customerPhone || 'N/A'}`, margin, custContactY);
    doc.text(`Email: ${formData.customerEmail || 'N/A'}`, margin, custContactY + 4);
    doc.text(`VAT: ${formData.customerVat || 'N/A'}`, margin, custContactY + 8);

    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text("VEHICLE DETAILS", col2X, startY);
    doc.line(col2X, startY + 2, pageWidth - margin, startY + 2);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(formData.vehicleMake || 'N/A', col2X, startY + 10);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60);
    doc.text(`Registration: ${formData.vehicleReg || 'N/A'}`, col2X, startY + 15);

    const tableY = startY + 30;
    autoTable(doc, {
      startY: tableY,
      head: [['DESCRIPTION', 'TYPE', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: lineItems.map(item => [
        item.description,
        item.type.toUpperCase(),
        item.qty,
        `R ${item.unitPrice.toFixed(2)}`,
        `R ${(item.qty * item.unitPrice).toFixed(2)}`
      ]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3, textColor: 20, lineWidth: 0, valign: 'middle' },
      headStyles: { fillColor: [248, 250, 252], textColor: 80, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      },
      foot: [[
        { content: 'Subtotal:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `R ${formData.subtotal.toFixed(2)}`, styles: { halign: 'right' } }
      ],
      [
        { content: 'VAT (15%):', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `R ${formData.vat.toFixed(2)}`, styles: { halign: 'right' } }
      ],
      [
        { content: 'Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
        { content: `R ${formData.total.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } }
      ],
      [
        { content: 'Amount Paid:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `R ${formData.amountPaid.toFixed(2)}`, styles: { halign: 'right' } }
      ],
      [
        { content: 'Balance Due:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: `R ${formData.balance.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245], textColor: formData.balance > 0 ? [220, 38, 38] : 20 } }
      ]],
      margin: { bottom: 50 }
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 15;
    const footerHeight = 40;
    const availableHeight = pageHeight - margin;

    if (finalY + footerHeight > availableHeight) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, finalY, pageWidth - margin, finalY);

    const footerTextY = finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text("BANKING DETAILS", margin, footerTextY);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(`Bank: ${bankName}`, margin, footerTextY + 5);
    doc.text(`Account Name: ${accountName}`, margin, footerTextY + 9);
    doc.text(`Account No: ${accountNumber}`, margin, footerTextY + 13);
    doc.text(`Branch Code: ${branchCode}`, margin, footerTextY + 17);
    doc.text(`Reference: ${formData.invoiceNumber}`, margin, footerTextY + 21);

    const filename = `Invoice_${formData.invoiceNumber}.pdf`;
    doc.save(filename);
  };

  const handleEmail = async () => {
    await generatePDF();
    const subject = encodeURIComponent(`Invoice ${formData.invoiceNumber} - ${formData.vehicleMake || 'Vehicle Service'}`);
    const body = encodeURIComponent(`Dear ${formData.customerName || 'Customer'},

Please find attached the invoice ${formData.invoiceNumber} for the work done on your ${formData.vehicleMake || 'vehicle'}.

Total Due: R ${formData.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
Balance Outstanding: R ${formData.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}

Best regards,
${name}`);

    setTimeout(() => {
        window.location.href = `mailto:${formData.customerEmail}?subject=${subject}&body=${body}`;
    }, 500);
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery) ||
    (c.companyName && c.companyName.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full pb-20">
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

      <div className="flex flex-wrap gap-2 py-4 mb-4">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="text-text-muted text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</a>
        <span className="text-text-muted text-sm font-medium leading-normal">/</span>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/invoices'); }} className="text-text-muted text-sm font-medium leading-normal hover:text-primary transition-colors">Invoices</a>
        <span className="text-text-muted text-sm font-medium leading-normal">/</span>
        <span className="text-text-main text-sm font-medium leading-normal">{id ? 'Edit Invoice' : 'Create New'}</span>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">{id ? `Invoice ${formData.invoiceNumber}` : 'Create New Invoice'}</h1>
          <p className="text-text-muted text-base font-normal leading-normal">{id ? 'View and edit invoice details' : 'Convert quotes or create manual invoices for workshop jobs.'}</p>
        </div>
        <div className="flex gap-3">
             <button onClick={generatePDF} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-surface-card hover:bg-background-light border border-border-light text-text-main text-sm font-bold transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>PDF</span>
              </button>
              <button onClick={handleEmail} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-surface-card hover:bg-background-light border border-border-light text-primary text-sm font-bold transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Email Invoice</span>
              </button>
             <button onClick={handleSave} className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-md shadow-primary/30">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h3 className="text-lg font-bold text-text-main">Invoice Details</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <p className="text-text-main text-sm font-bold">Invoice Number</p>
                  <input className="w-full rounded-lg border border-border-light bg-surface-card focus:ring-primary focus:border-primary h-12 px-4 text-text-main" type="text" value={formData.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} />
                </label>
                 <label className="flex flex-col gap-2">
                  <p className="text-text-main text-sm font-bold">Date Issued</p>
                  <input className="w-full rounded-lg border border-border-light bg-surface-card focus:ring-primary focus:border-primary h-12 px-4 text-text-main" type="date" value={formData.date} onChange={(e) => updateField('date', e.target.value)} />
                </label>
              </div>
          </div>

          <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">Customer & Vehicle</h3>
              </div>
              <button onClick={() => setShowCustomerModal(true)} className="text-primary text-sm font-bold hover:underline">Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 relative" ref={searchRef}>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-text-main">Search Customer</span>
                  <div className="relative">
                    <input 
                      className="w-full pl-10 pr-10 h-12 rounded-lg border border-border-light bg-background-light text-text-main focus:ring-primary focus:border-primary transition-all" 
                      placeholder="Search by name, business or phone..." 
                      type="text"
                      value={customerSearchQuery}
                      onFocus={() => setShowSearchResults(true)}
                      onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setShowSearchResults(true);
                      }}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-text-muted">search</span>
                    {customerSearchQuery && (
                        <button 
                            onClick={() => { setCustomerSearchQuery(''); setShowSearchResults(false); }}
                            className="absolute right-3 top-3 text-text-muted hover:text-red-500"
                        >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                    )}
                  </div>
                </label>

                {/* Search Results Dropdown */}
                {showSearchResults && customerSearchQuery.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-border-light rounded-xl shadow-2xl z-[50] overflow-hidden max-h-[250px] overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => selectCustomer(c)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-light text-left transition-colors border-b border-border-light last:border-0"
                                >
                                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                        {c.firstName[0]}{c.lastName[0]}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-bold text-text-main truncate">
                                            {c.isBusiness && c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`}
                                        </p>
                                        <p className="text-[10px] text-text-muted truncate">{c.phone} • {c.email}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-xs text-text-muted font-bold mb-2">No matching records</p>
                                <button onClick={() => setShowCustomerModal(true)} className="text-primary text-xs font-bold underline">Add new customer profile</button>
                            </div>
                        )}
                    </div>
                )}
              </div>
               <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text-main">Billing Entity</span>
                <input 
                  className="w-full h-12 px-4 rounded-lg border border-border-light bg-slate-50 text-text-main font-bold" 
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                />
              </label>
               <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text-main">Vehicle Registration</span>
                <input className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary focus:border-primary text-text-main font-mono uppercase" placeholder="e.g. CA 123-456" type="text" value={formData.vehicleReg} onChange={(e) => updateField('vehicleReg', e.target.value)} />
              </label>
               <label className="md:col-span-2 flex flex-col gap-2">
                <span className="text-sm font-bold text-text-main">Make & Model</span>
                <input className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card focus:ring-primary focus:border-primary text-text-main" placeholder="e.g. Toyota Hilux 2.8 GD-6" type="text" value={formData.vehicleMake} onChange={(e) => updateField('vehicleMake', e.target.value)} />
              </label>
            </div>
          </div>

          <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">build</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">Job Card Items</h3>
              </div>
            </div>
            <div className="w-full overflow-x-auto pb-4">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[45%]">Description</th>
                    <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[15%]">Type</th>
                    <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">Qty</th>
                    {isOwner && <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[18%]">Unit Price (R)</th>}
                    {isOwner && <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[10%] text-right">Total</th>}
                    <th className="py-3 px-2 text-xs font-bold text-text-muted uppercase tracking-wider w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {lineItems.map(item => (
                    <tr key={item.id} className="group border-b border-border-light hover:bg-background-light transition-colors">
                      <td className="p-2">
                        <input className="w-full bg-transparent border-0 focus:ring-0 p-0 text-text-main font-bold placeholder-text-muted" placeholder="Item description" type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <select 
                          className={`px-2 py-1 rounded border text-[10px] font-bold h-fit appearance-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all ${
                            item.type === 'Part' ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500' :
                            item.type === 'Labor' ? 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500' :
                            'bg-indigo-100 text-indigo-700 border-indigo-200 focus:ring-indigo-500'
                          }`}
                          value={item.type}
                          onChange={(e) => updateItem(item.id, 'type', e.target.value as any)}
                        >
                          <option value="Part">PARTS</option>
                          <option value="Labor">LABOR</option>
                          <option value="Repair">REPAIR</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input className="w-full bg-transparent border-0 focus:ring-0 p-0 text-text-main text-center font-semibold" type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value))} />
                      </td>
                      {isOwner && (
                        <td className="p-2">
                          <input className="w-full bg-transparent border-0 focus:ring-0 p-0 text-text-main text-right font-mono" type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} />
                        </td>
                      )}
                      {isOwner && (
                        <td className="p-2 font-bold text-text-main text-right font-mono tabular-nums">
                          {(item.qty * item.unitPrice).toFixed(2)}
                        </td>
                      )}
                      <td className="p-2 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-text-muted hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline px-2">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Add Line Item
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
          {isOwner ? (
            <>
              <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-md flex flex-col gap-4">
                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Invoice Status
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Paid', 'Outstanding', 'Overdue', 'Partial'].map((s) => (
                    <button key={s} onClick={() => updateField('status', s)} className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${formData.status === s ? 'bg-primary text-white border-primary shadow-sm' : 'bg-background-light text-text-muted border-border-light hover:bg-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-md flex flex-col gap-4">
                <h3 className="text-lg font-bold text-text-main border-b border-border-light pb-3">Payment Summary</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Subtotal</span>
                    <span className="font-medium text-text-main">R {formData.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>VAT (15%)</span>
                    <span className="font-medium text-text-main">R {formData.vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
                <div className="h-px bg-border-light w-full my-1"></div>
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-text-main">Total Due</span>
                  <span className="text-2xl font-black text-primary">R {formData.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-text-main">Record Payment</h4>
                  <div className="flex rounded-lg bg-background-light p-1">
                    {['EFT', 'Card', 'Cash'].map(method => (
                      <button key={method} onClick={() => updateField('paymentMethod', method)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.paymentMethod === method ? 'bg-surface-card shadow text-primary' : 'text-text-muted hover:text-text-main'}`}>{method}</button>
                    ))}
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-text-muted">Amount Paid (R)</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-text-muted">R</span>
                      <input className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-light bg-surface-card focus:ring-primary focus:border-primary text-sm font-semibold text-text-main" type="number" value={formData.amountPaid} onChange={(e) => updateField('amountPaid', parseFloat(e.target.value) || 0)} />
                    </div>
                  </label>
                  <div className={`p-3 rounded-lg flex justify-between items-center border ${formData.balance <= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <span className="text-xs font-bold">Balance Remaining</span>
                    <span className="text-sm font-black">R {formData.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
              </div>
            </>
          ) : (
            <div className="bg-surface-card rounded-xl border border-border-light p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-text-muted mb-2">lock</span>
                <p className="text-sm font-bold text-text-main">Financial Summary Restricted</p>
            </div>
          )}

           <div className="flex flex-col gap-3 mt-4">
              <button onClick={handleSave} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-lg shadow-sm transition-transform active:scale-[0.99] flex justify-center items-center gap-2">
                <span className="material-symbols-outlined">send</span>
                Finalize & Save Invoice
              </button>
              <button onClick={() => navigate('/invoices')} className="w-full bg-surface-card border border-border-light text-text-main font-semibold py-3 px-4 rounded-lg hover:bg-background-light transition-colors flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cancel
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
