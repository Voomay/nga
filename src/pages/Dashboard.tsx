
import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Oct 1', value: 4000 },
  { name: 'Oct 5', value: 3000 },
  { name: 'Oct 10', value: 5000 },
  { name: 'Oct 15', value: 4500 },
  { name: 'Oct 20', value: 8000 },
  { name: 'Oct 25', value: 6000 },
  { name: 'Oct 30', value: 9000 },
];

export const Dashboard: React.FC = () => {
  const { jobCards, invoices, quotes, activities, billingAlert, getWorkshopSubscriptionStatus, adminConfig } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = user?.role === 'Owner';
  const status = user ? getWorkshopSubscriptionStatus(user) : 'Inactive';

  // Calculate Real Stats
  const activeJobsCount = jobCards.filter(j => j.status === 'In Progress' || j.status === 'Waiting Parts').length;
  const draftQuotesCount = quotes.filter(q => q.status === 'Draft').length;
  const totalQuotesCount = quotes.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const outstandingAmount = invoices.reduce((acc, inv) => acc + inv.balance, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} mins ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-text-muted text-[10px] md:text-xs font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">Workshop Overview</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center h-10 px-5 rounded-xl bg-surface-card border border-border-light text-text-main hover:bg-background-light transition-all shadow-sm relative">
            <span className="material-symbols-outlined md:mr-2 text-[20px]">notifications</span>
            <span className="text-sm font-bold hidden sm:inline">Alerts</span>
            <span className="size-2 bg-red-500 rounded-full absolute top-2 right-2 border-2 border-surface-card"></span>
          </button>
        </div>
      </div>

      {/* Trial Welcome Notification - PRIORITY 1 */}
      {isOwner && status === 'Trial' && (
          <div className="p-6 rounded-[2rem] border border-blue-100 bg-blue-50/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-5 text-center md:text-left">
                <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-3xl">celebration</span>
                </div>
                <div>
                    <h3 className="text-lg font-black text-primary tracking-tight">Welcome to the Trial Cycle!</h3>
                    <p className="text-sm text-blue-700 font-medium">You have full access to the AutoFix Pro ecosystem for <span className="font-black">7 days</span>. No credit card required.</p>
                </div>
             </div>
             <button 
                onClick={() => navigate(adminConfig.showPricingInConsole ? '/billing' : '/support')}
                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap"
             >
                {adminConfig.showPricingInConsole ? 'Upgrade Plan Now' : 'Contact Implementation'}
             </button>
          </div>
      )}

      {/* Subscription Billing Cycle Notification (Owner Only) - ONLY if NOT in trial */}
      {isOwner && status !== 'Trial' && billingAlert && !billingAlert.isLocked && (
        <div className={`p-6 rounded-[2rem] border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 ${
            billingAlert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
        }`}>
            <div className="flex items-center gap-5 text-center md:text-left">
                <div className={`size-14 rounded-2xl flex items-center justify-center shadow-md ${
                    billingAlert.type === 'warning' ? 'bg-amber-600 text-white' : 'bg-primary text-white'
                }`}>
                    <span className="material-symbols-outlined text-3xl">{billingAlert.type === 'warning' ? 'priority_high' : 'notifications_active'}</span>
                </div>
                <div>
                    <h3 className={`text-lg font-black tracking-tight ${billingAlert.type === 'warning' ? 'text-amber-900' : 'text-primary'}`}>
                        {billingAlert.status === 'Grace Period' ? 'URGENT: Grace Period' : 'Payment Reminder'}
                    </h3>
                    <p className={`text-sm font-medium ${billingAlert.type === 'warning' ? 'text-amber-700' : 'text-slate-600'}`}>
                        {billingAlert.message}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => navigate('/billing')}
                className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 whitespace-nowrap ${
                    billingAlert.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-primary hover:bg-primary-hover text-white'
                }`}
            >
                Proceed to Payment
            </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Revenue Card */}
        <button 
          onClick={() => navigate('/invoices')}
          className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-primary/20 text-left transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-6xl">payments</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">Revenue (MTD)</p>
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-main tracking-tight">R {totalRevenue.toLocaleString()}</h2>
              <div className="mt-2 flex items-center gap-1.5 w-fit bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12.5%</span>
              </div>
            </div>
          </div>
        </button>

        {/* Vehicles in Bay Card */}
        <button 
          onClick={() => navigate('/job-cards')}
          className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-primary/20 text-left transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-6xl">garage</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">garage</span>
              </div>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">Vehicles in Bay</p>
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-main tracking-tight">{activeJobsCount} Active</h2>
              <div className="mt-4 flex flex-col gap-1.5">
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: `${Math.min(100, (activeJobsCount/5)*100)}%`}}></div>
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{Math.max(0, 5 - activeJobsCount)} Bays Available</p>
              </div>
            </div>
          </div>
        </button>

        {/* Total Quotes Card */}
        <button 
          onClick={() => navigate('/quotations')}
          className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-primary/20 text-left transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-6xl">pending_actions</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">Total Quotes</p>
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-main tracking-tight">{totalQuotesCount} Active</h2>
              <div className="mt-4 flex items-center gap-3">
                 <div className="flex -space-x-2">
                   <img className="size-6 rounded-full border-2 border-white ring-1 ring-slate-200" src="https://i.pravatar.cc/100?u=1" alt=""/>
                   <img className="size-6 rounded-full border-2 border-white ring-1 ring-slate-200" src="https://i.pravatar.cc/100?u=2" alt=""/>
                   {draftQuotesCount > 0 && <div className="size-6 rounded-full border-2 border-white ring-1 ring-slate-200 bg-slate-200 flex items-center justify-center text-[8px] font-bold">+{draftQuotesCount}</div>}
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{draftQuotesCount > 0 ? 'needs attention' : 'all processed'}</p>
              </div>
            </div>
          </div>
        </button>

        {/* Outstanding Invoices Card */}
        <button 
          onClick={() => navigate('/invoices')}
          className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-primary/20 text-left transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-6xl">receipt_long</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">Outstanding Invoices</p>
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-main tracking-tight">R {outstandingAmount.toLocaleString()}</h2>
              <div className={`mt-2 flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${overdueCount > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-text-muted border-slate-200'}`}>
                <span className="material-symbols-outlined text-sm">{overdueCount > 0 ? 'warning' : 'done'}</span>
                <span>{overdueCount} Overdue</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="flex flex-col gap-6 lg:w-1/3 min-w-0">
          <div className="bg-surface-card p-2 rounded-2xl border border-border-light shadow-sm flex flex-wrap md:flex-nowrap justify-between gap-2">
            <button 
              onClick={() => navigate('/quotations/create')}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span className="whitespace-nowrap">Quote</span>
            </button>
            <button 
              onClick={() => navigate('/job-cards/create')}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-background-light text-text-muted rounded-xl text-xs font-bold hover:bg-slate-200 hover:text-text-main transition-all border border-transparent hover:border-border-light"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span className="whitespace-nowrap">Job Card</span>
            </button>
            <button 
              onClick={() => navigate('/invoices/create')}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-background-light text-text-muted rounded-xl text-xs font-bold hover:bg-slate-200 hover:text-text-main transition-all border border-transparent hover:border-border-light"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span className="whitespace-nowrap">Invoice</span>
            </button>
          </div>

          <div className="bg-surface-card p-6 rounded-3xl border border-border-light shadow-sm flex-1 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-text-main">Recent Activity</h3>
              <button className="text-primary text-xs font-bold hover:underline" onClick={() => navigate('/reports')}>View All</button>
            </div>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
               {activities.length > 0 ? activities.slice(0, 15).map(act => (
                 <button 
                  key={act.id} 
                  onClick={() => act.link && navigate(act.link)}
                  className={`flex gap-4 items-start text-left group transition-all p-3 -mx-2 rounded-2xl ${act.link ? 'hover:bg-slate-50 cursor-pointer active:bg-slate-100' : 'cursor-default'}`}
                 >
                  <div className={`flex-none size-10 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${act.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                       <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">{act.title}</p>
                       <span className="flex-none text-[10px] text-text-muted font-bold whitespace-nowrap opacity-60 mt-0.5">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate leading-relaxed">{act.description}</p>
                  </div>
                </button>
               )) : (
                 <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-2">
                    <span className="material-symbols-outlined text-4xl">history</span>
                    <p className="text-xs font-bold uppercase tracking-widest">No activity yet</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Performance & Active Jobs */}
        <div className="flex flex-col gap-6 lg:w-2/3 min-w-0">
           {isOwner && (
             <div className="bg-surface-card p-6 rounded-3xl border border-border-light shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-text-main">Workshop Performance</h3>
                  <p className="text-xs text-text-muted">Activity trends over the last 30 days</p>
                </div>
                <div className="flex bg-background-light rounded-full p-1 border border-border-light">
                  <button className="px-3 py-1 rounded-full bg-surface-card shadow-sm text-xs font-bold text-text-main border border-border-light">Revenue</button>
                  <button className="px-3 py-1 rounded-full text-xs font-bold text-text-muted hover:text-text-main transition-colors">Expenses</button>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-light)', borderRadius: '12px' }}
                      labelStyle={{ color: 'var(--text-muted)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="rgb(var(--color-primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
             </div>
           )}

           <div className="bg-surface-card rounded-3xl border border-border-light shadow-sm overflow-hidden flex-1">
             <div className="p-5 border-b border-border-light flex justify-between items-center bg-background-light/30">
              <h3 className="text-base font-bold text-text-main">Active Jobs</h3>
              <button className="size-8 flex items-center justify-center rounded-full bg-surface-card border border-border-light hover:bg-background-light text-text-muted hover:text-text-main transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-background-light/50 text-text-muted text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Job ID</th>
                    <th className="px-6 py-4 whitespace-nowrap">Vehicle</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-sm">
                   {jobCards.slice(0, 8).map(job => (
                     <tr key={job.id} onClick={() => navigate(`/job-cards/${job.id}`)} className="group hover:bg-background-light transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-bold text-text-main whitespace-nowrap">{job.jobId}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main text-sm group-hover:text-primary transition-colors">{job.vehicleName}</span>
                          <span className="text-[10px] text-text-muted whitespace-nowrap">{job.vehicleReg}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          job.statusColor === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          job.statusColor === 'amber' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          job.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>{job.status}</span>
                      </td>
                    </tr>
                   ))}
                   {jobCards.length === 0 && (
                     <tr><td colSpan={3} className="p-12 text-center text-text-muted italic">No active jobs found.</td></tr>
                   )}
                </tbody>
              </table>
            </div>
             <div className="p-4 border-t border-border-light text-center bg-background-light/30">
              <button onClick={() => navigate('/job-cards')} className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto">
                <span>View All Active Jobs</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};
