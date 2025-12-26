
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

type HistoryTab = 'Jobs' | 'Invoices' | 'Quotes';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, jobCards, invoices, quotes, deleteCustomer } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<HistoryTab>('Jobs');
  const isOwner = user?.role === 'Owner';

  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background-light">
        <span className="material-symbols-outlined text-6xl text-text-muted mb-4 opacity-20">person_off</span>
        <h2 className="text-2xl font-bold text-text-main tracking-tight">Customer Not Found</h2>
        <p className="text-text-muted mt-2">The profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/customers')} className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-all">Back to Directory</button>
      </div>
    );
  }

  // Data Filtering Logic
  const customerNameMatch = `${customer.firstName} ${customer.lastName}`;
  const companyMatch = customer.companyName || '___NON_EXISTENT___';
  
  const linkedJobs = jobCards.filter(j => 
    j.customerName.includes(customerNameMatch) || j.customerName.includes(companyMatch)
  );
  const linkedInvoices = invoices.filter(inv => 
    inv.customerName.includes(customerNameMatch) || inv.customerName.includes(companyMatch)
  );
  const linkedQuotes = quotes.filter(q => 
    q.customerName.includes(customerNameMatch) || q.customerName.includes(companyMatch)
  );

  const outstanding = linkedInvoices.reduce((acc, inv) => acc + inv.balance, 0);
  const totalInvoiced = linkedInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const activeJobs = linkedJobs.filter(j => j.status !== 'Completed').length;
  const vehiclesCount = customer.vehicles?.length || 0;

  return (
    <div className="flex-1 w-full bg-background-light overflow-y-auto">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 flex flex-col gap-8 pb-20">
        
        {/* Breadcrumbs & Actions Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm">
              <button onClick={() => navigate('/customers')} className="text-text-muted font-medium hover:text-primary transition-colors">Customers</button>
              <span className="text-text-muted material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-primary font-bold">{customer.firstName} {customer.lastName}</span>
            </div>
            <h1 className="text-text-main text-3xl font-black leading-tight tracking-tight">Customer Profile</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
              className="flex items-center justify-center h-10 px-4 bg-white border border-border-light hover:bg-[#f8f9fa] text-text-main rounded-lg text-sm font-bold gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={() => navigate('/quotations/create')}
              className="flex items-center justify-center h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-bold gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">request_quote</span>
              <span>New Quote</span>
            </button>
            <button 
              onClick={() => navigate('/job-cards/create')}
              className="flex items-center justify-center h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold gap-2 shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Job Card</span>
            </button>
          </div>
        </div>

        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Outstanding Balance</p>
              <h3 className={`text-2xl font-black ${outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>R {outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className={`size-12 rounded-full flex items-center justify-center ${outstanding > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <span className="material-symbols-outlined icon-fill">account_balance_wallet</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Total Invoiced (LTV)</p>
              <h3 className="text-2xl font-black text-text-main">R {totalInvoiced.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined icon-fill">payments</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Active Jobs</p>
              <h3 className="text-2xl font-black text-primary">{activeJobs}</h3>
            </div>
            <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined icon-fill">engineering</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
            <div>
              <p className="text-text-muted text-sm font-medium mb-1">Vehicles Linked</p>
              <h3 className="text-2xl font-black text-text-main">{vehiclesCount}</h3>
            </div>
            <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted">
              <span className="material-symbols-outlined icon-fill">directions_car</span>
            </div>
          </div>
        </div>

        {/* Main Section: Profile Info | Vehicles | History Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Personal Detail Card */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-border-light bg-gradient-to-b from-background-light to-white flex flex-col items-center text-center">
                <div className="size-24 rounded-full border-4 border-white shadow-lg bg-primary/10 flex items-center justify-center text-primary font-black text-3xl mb-4">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <h3 className="text-xl font-black text-text-main">{customer.firstName} {customer.lastName}</h3>
                <p className="text-text-muted text-sm font-bold uppercase tracking-wider mt-1">{customer.isBusiness ? customer.companyName : 'Private Customer'}</p>
                <div className="mt-4 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {customer.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">Verified</span>
                </div>
              </div>
              <div className="p-2">
                <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors group">
                  <span className="material-symbols-outlined text-text-muted text-[20px] group-hover:text-primary">phone</span>
                  <span className="text-sm font-bold text-text-main">{customer.phone}</span>
                </div>
                <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors group">
                  <span className="material-symbols-outlined text-text-muted text-[20px] group-hover:text-primary">email</span>
                  <a className="text-sm font-bold text-primary hover:underline truncate" href={`mailto:${customer.email}`}>{customer.email}</a>
                </div>
                <div className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 rounded-lg transition-colors group">
                  <span className="material-symbols-outlined text-text-muted text-[20px] mt-0.5 group-hover:text-primary">location_on</span>
                  <span className="text-sm font-medium text-text-main leading-snug">
                    {customer.address || 'Address not set'}<br/>
                    {customer.suburb && `${customer.suburb}, `}{customer.postalCode}
                  </span>
                </div>
                {customer.vatNumber && (
                  <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors group">
                    <span className="material-symbols-outlined text-text-muted text-[20px] group-hover:text-primary">receipt_long</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-text-muted font-black tracking-widest">VAT Number</span>
                      <span className="text-sm font-bold text-text-main">{customer.vatNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Health Indicator */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6">
                <h4 className="text-xs font-black text-text-muted mb-5 uppercase tracking-[0.2em]">Financial Standing</h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-black mb-2">
                      <span className="text-text-muted">Balance Ratio</span>
                      <span className={`${outstanding > totalInvoiced * 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {totalInvoiced > 0 ? Math.round((outstanding / totalInvoiced) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${outstanding > totalInvoiced * 0.5 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.min(100, totalInvoiced > 0 ? (outstanding / totalInvoiced) * 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center h-10 bg-slate-50 hover:bg-slate-100 border border-border-light text-text-main rounded-xl text-xs font-black transition-all gap-2 group">
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">send</span>
                    Send Statement
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Middle Column: Vehicle Fleet */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-border-light flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-text-main text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">directions_car</span>
                  Vehicles ({vehiclesCount})
                </h3>
                <button className="text-primary text-[11px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                  <span className="material-symbols-outlined text-[14px]">add</span> Add Fleet
                </button>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {customer.vehicles && customer.vehicles.length > 0 ? (
                  customer.vehicles.map((v, i) => (
                    <div key={i} className="group border border-border-light rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all bg-white cursor-pointer">
                      <div className="flex h-28">
                        <div className="w-32 bg-slate-100 bg-cover bg-center shrink-0 border-r border-border-light flex items-center justify-center text-slate-300" 
                             style={{ backgroundImage: i === 0 ? "url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400')" : "" }}>
                          {i !== 0 && <span className="material-symbols-outlined text-4xl">garage</span>}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-text-main text-sm truncate pr-2 group-hover:text-primary transition-colors">{v}</h4>
                            <span className="text-[10px] font-black bg-background-light px-2 py-0.5 rounded border border-border-light text-text-muted shrink-0">REG: CA 123-456</span>
                          </div>
                          <p className="text-xs font-medium text-text-muted mb-2 italic">Standard Maintenance Cycle</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">speed</span> 158k km</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event</span> Oct 2023</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-border-light rounded-2xl bg-background-light/50 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-slate-200">car_repair</span>
                    <p className="text-xs font-bold text-text-muted">No vehicles linked to profile.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: History Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="px-6 pt-2 border-b border-border-light flex items-center justify-between bg-slate-50/50">
                <div className="flex space-x-6">
                  <button 
                    onClick={() => setActiveTab('Jobs')}
                    className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'Jobs' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-300'}`}
                  >
                    Job Cards ({linkedJobs.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('Invoices')}
                    className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'Invoices' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-300'}`}
                  >
                    Invoices ({linkedInvoices.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('Quotes')}
                    className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'Quotes' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-300'}`}
                  >
                    Quotes ({linkedQuotes.length})
                  </button>
                </div>
                <button className="text-text-muted hover:text-primary transition-all p-2 rounded-full hover:bg-primary/10" title="Bulk Download History">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
              </div>
              
              <div className="flex flex-col divide-y divide-border-light flex-1 overflow-y-auto">
                {activeTab === 'Jobs' && linkedJobs.map(job => (
                  <div key={job.id} onClick={() => navigate(`/job-cards/${job.id}`)} className="p-5 hover:bg-slate-50 transition-all flex items-center gap-4 cursor-pointer group">
                    <div className={`size-11 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${job.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      <span className="material-symbols-outlined text-[22px]">{job.status === 'Completed' ? 'check_circle' : 'engineering'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-black text-text-main truncate group-hover:text-primary transition-colors">{job.jobType || 'Service/Repair'}</h5>
                        <span className="text-xs font-black text-text-main tabular-nums"># {job.jobId}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          {job.vehicleName} • <span className="bg-slate-100 px-1 rounded text-[10px]">{job.vehicleReg}</span>
                        </span>
                        <span className={`${job.status === 'Completed' ? 'text-emerald-600' : 'text-blue-600'} font-black`}>{job.status}</span>
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5 ml-2" title="Download Job Card PDF" onClick={(e) => { e.stopPropagation(); navigate(`/job-cards/preview/${job.id}`); }}>
                      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                    </button>
                  </div>
                ))}

                {activeTab === 'Invoices' && linkedInvoices.map(inv => (
                  <div key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="p-5 hover:bg-slate-50 transition-all flex items-center gap-4 cursor-pointer group">
                    <div className="size-11 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
                      <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-black text-text-main truncate group-hover:text-primary transition-colors">Tax Invoice {inv.number}</h5>
                        <span className="text-sm font-black text-text-main tabular-nums">R {inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
                        <span>{inv.date} • {inv.vehicleReg}</span>
                        <span className={`px-2 py-0.5 rounded-full ${inv.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{inv.status}</span>
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5 ml-2" title="Download Invoice PDF">
                      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                    </button>
                  </div>
                ))}

                {activeTab === 'Quotes' && linkedQuotes.map(quote => (
                  <div key={quote.id} onClick={() => navigate(`/quotations/${quote.id}`)} className="p-5 hover:bg-slate-50 transition-all flex items-center gap-4 cursor-pointer group">
                    <div className="size-11 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
                      <span className="material-symbols-outlined text-[22px]">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-black text-text-main truncate group-hover:text-primary transition-colors">Quotation {quote.number}</h5>
                        <span className="text-sm font-black text-text-main tabular-nums">R {quote.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
                        <span>{quote.date} • {quote.regNo}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          quote.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' :
                          quote.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {quote.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5 ml-2" title="Download Quote PDF">
                      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                    </button>
                  </div>
                ))}

                {( (activeTab === 'Jobs' && linkedJobs.length === 0) || 
                   (activeTab === 'Invoices' && linkedInvoices.length === 0) ||
                   (activeTab === 'Quotes' && linkedQuotes.length === 0) ) && (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-5xl text-slate-100">history_edu</span>
                    <p className="text-sm font-bold text-text-muted">No records found for this category.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 border-t border-border-light p-4 text-center">
                <button 
                  onClick={() => {
                    if (activeTab === 'Jobs') navigate('/job-cards');
                    if (activeTab === 'Invoices') navigate('/invoices');
                    if (activeTab === 'Quotes') navigate('/quotations');
                  }}
                  className="text-xs font-black text-primary hover:underline uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                >
                  View Full Global History
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
