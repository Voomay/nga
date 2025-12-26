
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { PaymentVerification } from '../types';

interface SubscriptionRecord {
  id: string;
  workshopName: string;
  ownerName: string;
  email: string;
  logo: string;
  plan: string;
  amount: string;
  status: 'Paid' | 'Outstanding' | 'Grace Period' | 'Cancelled' | 'Trial' | 'Pending Verification';
  nextBilling: string;
  reference: string;
  trialDaysLeft?: number;
}

export const AdminMemberSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { paymentVerifications, updatePaymentVerificationStatus, getWorkshopSubscriptionStatus, platformInvoices, availablePlans } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [activeTab, setActiveTab] = useState<'Workshops' | 'Payments'>('Workshops');
  const [selectedPOP, setSelectedPOP] = useState<PaymentVerification | null>(null);

  // Memoize subscription data calculation for real-time reactivity to context changes
  const subscriptionData = useMemo(() => {
    const usersStr = localStorage.getItem('autofix_users_db');
    if (!usersStr) return [];

    const users = JSON.parse(usersStr);
    const ownerUsers = users.filter((u: any) => u.role === 'Owner');
    
    return ownerUsers.map((u: any): SubscriptionRecord => {
      const dynamicStatus = getWorkshopSubscriptionStatus(u);
      let planName = 'Trial Period';
      let amountStr = 'R 0.00 (Trial)';
      let nextBillingDate = 'N/A';
      let trialRemaining: number | undefined = undefined;

      if (u.subscriptionPlanId) {
        const activePlan = availablePlans.find(p => p.id === u.subscriptionPlanId);
        if (activePlan) {
          planName = activePlan.name;
          amountStr = `R ${activePlan.price} / ${activePlan.duration.toLowerCase()}`;
        } else {
          planName = 'Legacy Plan';
          amountStr = 'Manual Billing';
        }
        
        const now = new Date();
        nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
      } else if (u.trialStartDate) {
        const start = new Date(u.trialStartDate).getTime();
        const now = Date.now();
        const diffDays = 7 - (now - start) / (1000 * 60 * 60 * 24);
        trialRemaining = Math.ceil(diffDays);
        planName = '7-Day Free Trial';
        amountStr = 'FREE';
        nextBillingDate = trialRemaining <= 0 ? 'Expired' : `${trialRemaining}d left`;
      }

      // Check if there is a pending POP for this user
      const pendingPop = paymentVerifications.find(p => p.workshopId === u.id && p.status === 'Pending');
      const finalStatus = pendingPop ? 'Pending Verification' : dynamicStatus as SubscriptionRecord['status'];

      return {
        id: u.id,
        workshopName: u.workshopName || 'Unnamed Workshop',
        ownerName: u.name,
        email: u.email,
        logo: u.workshopLogo || 'https://ui-avatars.com/api/?name=W&background=random',
        plan: planName,
        amount: amountStr,
        status: finalStatus,
        nextBilling: nextBillingDate,
        reference: `REF-${u.id.toUpperCase()}`,
        trialDaysLeft: trialRemaining
      };
    });
  }, [paymentVerifications, getWorkshopSubscriptionStatus, platformInvoices, availablePlans]);

  const filteredData = subscriptionData.filter(item => {
    const matchesSearch = item.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingPOPs = paymentVerifications.filter(p => p.status === 'Pending');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200">
      
      {/* POP Verification Modal */}
      {selectedPOP && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
             <div className="bg-white dark:bg-card-dark w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in duration-300">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 flex items-center justify-center min-h-[400px]">
                    <img src={selectedPOP.popImage} className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg" alt="POP" />
                </div>
                <div className="w-full md:w-[350px] p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Review Payment</h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium">Verify the payment matches the reference and amount below.</p>
                        <div className="space-y-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Workshop</span>
                                <span className="font-bold">{selectedPOP.workshopName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reference</span>
                                <span className="font-black text-primary font-mono">{selectedPOP.reference}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount to Verify</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">R {selectedPOP.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Plan Selected</span>
                                <span className="font-bold capitalize">{selectedPOP.planId} Tier</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-10">
                        <button 
                            onClick={() => { updatePaymentVerificationStatus(selectedPOP.id, 'Approved'); setSelectedPOP(null); }}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >Approve & Activate</button>
                        <button 
                            onClick={() => { updatePaymentVerificationStatus(selectedPOP.id, 'Rejected'); setSelectedPOP(null); }}
                            className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all"
                        >Reject Payment</button>
                        <button 
                            onClick={() => setSelectedPOP(null)}
                            className="w-full h-12 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl font-bold transition-all"
                        >Close Review</button>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-card-dark border-r border-[#e0dbe6] dark:border-gray-800 transition-colors duration-200 flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[24px]">directions_car</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">AutoDoc</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">payments</span>
            <span className="text-sm font-bold">Member Subscriptions</span>
          </button>
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
            <span className="text-sm font-medium">Billing Settings</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">support_agent</span>
            <span className="text-sm font-medium">Support Tickets</span>
          </button>
          <button onClick={() => navigate('/admin/landing-page')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">auto_fix_high</span>
            <span className="text-sm font-medium">Landing Page Editor</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#e0dbe6] dark:border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate('/')}>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Admin&background=0d51b0&color=fff')"}}></div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-bold truncate">SysAdmin Root</p>
              <p className="text-xs text-slate-500 truncate">admin@autodoc.co.za</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-sm">
            <button onClick={() => navigate('/admin')} className="hover:text-primary transition-colors">Dashboard</button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-semibold">Member Subscriptions</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">notifications</span>
              {pendingPOPs.length > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>
            <button className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-700 transition-colors gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Master List</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Subscription Management</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Oversee workshop payments, cycle health, and manual EFT verifications.</p>
              </div>
              <div className="flex bg-white dark:bg-card-dark p-1 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm self-start">
                  <button 
                    onClick={() => setActiveTab('Workshops')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Workshops' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                  >Directory</button>
                  <button 
                    onClick={() => setActiveTab('Payments')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'Payments' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Verification Queue
                    {pendingPOPs.length > 0 && <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${activeTab === 'Payments' ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>{pendingPOPs.length}</span>}
                  </button>
              </div>
            </div>

            {activeTab === 'Workshops' ? (
                <>
                {/* Filter & Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input 
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg leading-5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm" 
                    placeholder="Search workshops, owners, or reference..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <div className="relative min-w-[160px]">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary rounded-lg shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="All Statuses">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Trial">Trial</option>
                        <option value="Pending Verification">Verification Pending</option>
                        <option value="Outstanding">Outstanding (Due)</option>
                        <option value="Grace Period">Grace Period</option>
                        <option value="Cancelled">Suspended (Cancelled)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                    </div>
                </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workshop & Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan & Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Cycle Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">EFT Reference</th>
                        <th className="relative px-6 py-4">
                            <span className="sr-only">Actions</span>
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 size-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100 shadow-sm" style={{backgroundImage: `url("${item.logo}")`}}></div>
                                <div className="ml-4">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{item.workshopName}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.ownerName} • {item.email}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${item.status === 'Trial' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{item.plan}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.amount}</span>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                item.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                item.status === 'Grace Period' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                item.status === 'Trial' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                item.status === 'Pending Verification' ? 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse' :
                                item.status === 'Outstanding' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                'bg-red-100 text-red-800 border-red-200'
                            }`}>
                                <span className={`size-1.5 rounded-full ${
                                item.status === 'Paid' ? 'bg-green-500' :
                                item.status === 'Grace Period' ? 'bg-amber-500' :
                                item.status === 'Trial' ? 'bg-blue-500' :
                                item.status === 'Pending Verification' ? 'bg-purple-500' :
                                item.status === 'Outstanding' ? 'bg-indigo-500' :
                                'bg-red-500'
                                }`}></span>
                                {item.status}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono font-bold">
                            {item.reference}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
                </>
            ) : (
                <div className="flex flex-col gap-6">
                    {pendingPOPs.length === 0 ? (
                        <div className="bg-white dark:bg-card-dark rounded-[2rem] p-20 text-center flex flex-col items-center gap-4 border border-slate-200 dark:border-gray-800">
                            <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-400">Queue Clear</h3>
                            <p className="text-slate-500 text-sm">There are no pending proof of payments to verify.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingPOPs.map(pop => (
                                <div key={pop.id} className="bg-white dark:bg-card-dark rounded-[2rem] border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                                        <img src={pop.popImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="POP" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => setSelectedPOP(pop)} className="px-6 py-2 bg-white text-slate-900 rounded-full font-bold text-sm shadow-xl">View Details</button>
                                        </div>
                                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">New Upload</div>
                                    </div>
                                    <div className="p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">{pop.workshopName}</h4>
                                                <p className="text-xs text-slate-400 font-mono">{pop.reference}</p>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">R {pop.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-gray-800"></div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Submitted</span>
                                                <span className="text-xs font-bold">{new Date(pop.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => setSelectedPOP(pop)} className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Verify POP</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
