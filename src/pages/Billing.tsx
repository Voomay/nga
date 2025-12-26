
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkshop } from '../context/WorkshopContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PlatformInvoice } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Billing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email, vat, updateName, updateEmail, updateVat, brandColor } = useWorkshop();
  const { user } = useAuth();
  const { systemBankDetails, submitPaymentVerification, paymentVerifications, availablePlans, platformInvoices, billingAlert, getWorkshopSubscriptionStatus, adminConfig } = useData();
  
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const popInputRef = useRef<HTMLInputElement>(null);

  // Status check
  const status = user ? getWorkshopSubscriptionStatus(user) : 'Inactive';
  const isSuspended = status === 'Suspended' || status === 'Trial Expired' || billingAlert?.isLocked;

  // Handle auto-focusing on payment if redirected from a lockout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('intent') === 'pay' && user?.subscriptionPlanId) {
        setSelectedPlanId(user.subscriptionPlanId);
    }
  }, [location.search, user]);

  // Filter local data
  const myPendingPayments = paymentVerifications.filter(p => p.workshopId === user?.id && p.status === 'Pending');
  const myPlatformInvoices = platformInvoices.filter(i => i.workshopId === user?.id);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleUploadPOP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && selectedPlanId) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const plan = availablePlans.find(p => p.id === selectedPlanId);
            const amount = plan ? parseFloat(plan.price) : 0;
            
            submitPaymentVerification({
                workshopId: user.id,
                workshopName: user.workshopName,
                planId: selectedPlanId,
                amount: amount,
                reference: `REF-${user.id.toUpperCase()}`,
                popImage: reader.result as string
            });
            alert('Your Proof of Payment has been uploaded and is pending verification. Your account access will be restored once reviewed by administration.');
            setSelectedPlanId(null);
            // Navigate back to clear the intent from URL
            navigate('/billing', { replace: true });
        };
        reader.readAsDataURL(file);
    }
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [13, 81, 176];
  };

  const downloadInvoice = (inv: PlatformInvoice) => {
    const doc = new jsPDF();
    const primaryColor = hexToRgb(brandColor);
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("SUBSCRIPTION TAX INVOICE", 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: ${inv.number}`, 20, 45);
    doc.text(`Date Issued: ${inv.date}`, 20, 50);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 55);
    
    // Platform Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text("AutoFix Pro Platform Solutions", 140, 45);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text("VAT Reg: 40102938475", 140, 50);
    doc.text("Admin Support Hub, Cape Town, 8001", 140, 55);
    
    doc.setDrawColor(200);
    doc.line(20, 65, 190, 65);
    
    // Bill To
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("BILL TO:", 20, 75);
    doc.setFont(undefined, 'normal');
    doc.text(name || user?.workshopName || 'Workshop Owner', 20, 81);
    doc.text(email || user?.email || '', 20, 86);
    doc.text(`VAT: ${vat || 'N/A'}`, 20, 91);
    
    // Table
    autoTable(doc, {
        startY: 105,
        head: [['ITEM DESCRIPTION', 'BILLING CYCLE', 'TOTAL (ZAR)']],
        body: [[
            `AutoFix Pro Software Subscription - ${inv.planName}`,
            inv.duration,
            `R ${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`
        ]],
        headStyles: { fillColor: primaryColor }
    });
    
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`GRAND TOTAL: R ${inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 190, finalY, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Payment received via manual EFT. Thank you for choosing AutoFix Pro.", 105, finalY + 20, { align: 'center' });
    
    doc.save(`${inv.number}.pdf`);
  };

  const currentPlanId = user?.subscriptionPlanId;
  const currentPlan = availablePlans.find(p => p.id === currentPlanId);

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 md:p-8 lg:p-10 pb-20">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
              <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button> 
              <span className="material-symbols-outlined text-xs">chevron_right</span> 
              <span className="font-semibold text-text-main">Billing</span>
            </div>
            <h1 className="text-text-main text-3xl font-black leading-tight tracking-tight">Subscription & Billing</h1>
            <p className="text-text-muted text-base">
                {adminConfig.showPricingInConsole 
                    ? 'Select a flexible billing cycle. All plans include full access to the AutoFix Pro ecosystem.'
                    : 'Manage your workshop license and subscription verification status.'}
            </p>
          </div>
        </div>

        {/* Alert for Suspended Accounts */}
        {isSuspended && (
            <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-500 shadow-lg">
                <div className="size-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <div>
                    <h3 className="text-xl font-black text-red-900 tracking-tight">Access Interruption Detected</h3>
                    <p className="text-red-700 font-medium leading-relaxed max-w-2xl">
                        {status === 'Trial Expired' 
                          ? 'Your 7-day free trial has ended. To continue managing your workshop with our professional toolset, please finalize your subscription below.'
                          : 'Your account is suspended due to an outstanding payment cycle. Please complete a manual EFT to reactivate your environment.'}
                    </p>
                </div>
            </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-card rounded-xl border border-border-light p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  isSuspended ? 'bg-red-50 text-red-700 border-red-100' : 
                  status === 'Trial' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-orange-50 text-orange-700 border-orange-100'
              }`}>
                {status}
              </span>
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium">Account Status</p>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                {currentPlan ? currentPlan.name : status === 'Trial' ? 'Trial Period' : 'Subscription Required'}
              </h3>
              <p className="text-sm text-text-muted mt-1">{currentPlanId ? 'EFT manual cycle' : 'Needs Selection'}</p>
            </div>
          </div>

          <div className="bg-surface-card rounded-xl border border-border-light p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <span className="material-symbols-outlined">verified</span>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium">EFT Payment Reference</p>
              <h3 className="text-2xl font-black text-text-main mt-1 font-mono">REF-{user?.id.toUpperCase()}</h3>
              <p className="text-xs text-text-muted mt-1 uppercase tracking-tighter">REQUIRED FOR VERIFICATION</p>
            </div>
          </div>

          <div className="bg-surface-card rounded-xl border border-border-light p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <span className="material-symbols-outlined">history</span>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium">Verification Status</p>
              <h3 className="text-2xl font-bold text-text-main mt-1">
                  {myPendingPayments.length > 0 ? 'Pending Approval' : 'No Pending Logs'}
              </h3>
              <p className="text-sm text-text-muted mt-1">Check back in 12-24 hours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 flex flex-col gap-8">
            {/* Plans Section - CONDITIONAL BASED ON ADMIN CONFIG */}
            {adminConfig.showPricingInConsole ? (
                <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">grid_view</span> Choose Your Cycle
                    </h2>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                        FULL FEATURES INCLUDED IN ALL PLANS
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availablePlans.map((plan) => (
                    <div key={plan.id} className={`group flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden relative ${selectedPlanId === plan.id ? 'border-primary border-2 bg-primary/5' : 'border-border-light bg-surface-card hover:border-primary/40 shadow-sm'}`}>
                        {plan.popular && <div className="absolute top-0 left-0 right-0 bg-primary text-white text-[10px] font-black py-2 text-center uppercase tracking-[0.2em] shadow-sm">Best Value</div>}
                        <div className="p-6 flex-1 flex flex-col pt-10">
                            <div className="flex flex-col gap-1 mb-4">
                                <h3 className="text-base font-black text-text-main uppercase tracking-widest">{plan.name}</h3>
                                <p className="text-xs text-text-muted font-medium leading-relaxed">{plan.description}</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-2xl font-black text-text-main tracking-tighter">R {plan.price}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">/ {plan.duration.toLowerCase()}</span>
                            </div>
                            <div className="h-px bg-border-light w-full mb-6"></div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-text-main font-bold">
                                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                            <button 
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedPlanId === plan.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900 text-white hover:bg-black active:translate-y-0.5 shadow-md'}`}
                            >
                                {selectedPlanId === plan.id ? 'Active Selection' : 'Select Plan'}
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-border-light shadow-sm flex flex-col items-center text-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-600"></div>
                    <div className="size-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">corporate_fare</span>
                    </div>
                    <div className="flex flex-col gap-2 max-w-lg">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tailored Workshop Solutions</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            AutoFix Pro has transitioned to customized volume-based pricing. 
                            Our implementation specialists will reach out to discuss the optimal cycle for your specific workshop volume and bay capacity.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/support')}
                        className="px-10 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[20px]">headset_mic</span>
                        Contact Deployment Team
                    </button>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing tiers are currently managed by site administration</p>
                </div>
            )}

            {/* EFT Payment Instruction Overlay */}
            {selectedPlanId && (
                <div id="payment-drawer" className="bg-primary text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-bl-full z-0 translate-x-32 -translate-y-32"></div>
                    <div className="relative z-10 flex flex-col gap-10">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Action Required</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Manual Verification Flow</h3>
                            <p className="text-white/80 font-medium max-w-xl text-lg">Please perform a manual EFT to the account below. Use your unique reference number and upload proof to activate the plan.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                             <div className="flex flex-col gap-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Recipient Account</h4>
                                <div className="space-y-6 bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-white/40 mb-1">Bank</span>
                                            <span className="font-bold text-lg">{systemBankDetails.bankName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-white/40 mb-1">Branch</span>
                                            <span className="font-bold text-lg font-mono">{systemBankDetails.branchCode}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-white/40 mb-1">Account Holder</span>
                                        <span className="font-bold text-lg">{systemBankDetails.accountName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-white/40 mb-1">Account Number</span>
                                        <span className="font-black text-2xl font-mono tracking-widest">{systemBankDetails.accountNumber}</span>
                                    </div>
                                </div>
                             </div>

                             <div className="flex flex-col gap-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Submit Proof</h4>
                                <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl flex flex-col gap-6 h-full border border-white">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your reference (Required)</p>
                                        <p className="text-3xl font-black text-primary font-mono tracking-tighter">REF-{user?.id.toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount to Pay</p>
                                        <p className="text-2xl font-black">R {availablePlans.find(p => p.id === selectedPlanId)?.price || '0.00'}</p>
                                    </div>
                                    <button 
                                        onClick={() => popInputRef.current?.click()}
                                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-xl"
                                    >
                                        <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                                        Upload POP
                                    </button>
                                    <input type="file" ref={popInputRef} className="hidden" accept="image/*,.pdf" onChange={handleUploadPOP} />
                                    <button onClick={() => setSelectedPlanId(null)} className="text-slate-400 text-xs font-bold hover:text-red-500 transition-colors uppercase tracking-widest">Cancel selection</button>
                                </div>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-black/10 rounded-2xl border border-white/5">
                            <span className="material-symbols-outlined text-white/60">help_center</span>
                            <p className="text-xs text-white/80 italic">{systemBankDetails.paymentInstructions}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing History Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history_edu</span> Payment History & Tax Invoices
                </h2>
                <div className="bg-surface-card rounded-3xl border border-border-light shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background-light/50 border-b border-border-light">
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Invoice #</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Description</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Cycle</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Status</th>
                                    <th className="p-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {myPlatformInvoices.length > 0 ? myPlatformInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-5 text-sm font-black text-text-main">{inv.number}</td>
                                        <td className="p-5 text-sm font-medium text-text-muted">{inv.date}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-main">{inv.planName}</span>
                                                <span className="text-[10px] text-text-muted uppercase font-black">Software License</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 uppercase tracking-tighter">{inv.duration}</span>
                                        </td>
                                        <td className="p-5 text-right text-sm font-black text-text-main whitespace-nowrap">R {inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="p-5 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                Paid
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button 
                                                onClick={() => downloadInvoice(inv)}
                                                className="size-10 rounded-full hover:bg-primary/10 text-text-muted hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-primary/20"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-text-muted">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-5xl opacity-10">receipt_long</span>
                                                <p className="font-bold">No payment history found yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Business Info Section */}
            <div className="bg-surface-card rounded-2xl border border-border-light shadow-sm p-8 flex flex-col h-fit">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <span className="material-symbols-outlined">business</span>
                </div>
                <h2 className="text-xl font-bold text-text-main">Billing Entity</h2>
              </div>
              <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Legal Workshop Name</label>
                  <input className="w-full h-12 px-4 rounded-xl border-border-light text-sm font-bold text-text-main focus:border-primary focus:ring-primary bg-background-light/50 transition-all" type="text" value={name} onChange={e => updateName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">VAT Number</label>
                  <input className="w-full h-12 px-4 rounded-xl border-border-light text-sm font-mono text-text-main focus:border-primary focus:ring-primary bg-background-light/50 transition-all" type="text" placeholder="Optional" value={vat} onChange={e => updateVat(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Admin Email</label>
                  <input className="w-full h-12 px-4 rounded-xl border-border-light text-sm font-bold text-text-main focus:border-primary focus:ring-primary bg-background-light/50 transition-all" type="email" value={email} onChange={e => updateEmail(e.target.value)} />
                </div>
                <button 
                  onClick={() => { setIsSaving(true); setTimeout(() => setIsSaving(false), 1000); }}
                  className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 mt-2"
                >
                  {isSaving ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Support Box */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col gap-4 shadow-xl">
                <h4 className="text-lg font-black tracking-tight">Need assistance?</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">If you're having trouble with EFT verification or require a custom volume quote, our billing team is here to help.</p>
                <button onClick={() => navigate('/support')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-2 border border-white/10">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
