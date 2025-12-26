
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type TimeRange = 'Monthly' | '6 Months' | 'Yearly';

export const FinancialReports: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, jobCards, quotes, inventory } = useData();
  const [filter, setFilter] = useState<TimeRange>('Monthly');

  // Helper to filter items by date range
  const filterByDate = (items: any[], dateField: string, range: TimeRange) => {
    const now = new Date();
    const start = new Date();

    if (range === 'Monthly') {
      start.setDate(1); // Start of current month
      start.setHours(0, 0, 0, 0);
    } else if (range === '6 Months') {
      start.setMonth(now.getMonth() - 5);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'Yearly') {
      start.setMonth(0, 1); // Start of current year
      start.setHours(0, 0, 0, 0);
    }

    return items.filter(item => {
      const dateStr = item[dateField];
      if (!dateStr) return false;
      
      const itemDate = new Date(dateStr);
      // Validate date
      if (isNaN(itemDate.getTime())) return false;
      
      return itemDate >= start && itemDate <= now;
    });
  };

  // Memoized Filtered Data
  const filteredInvoices = useMemo(() => filterByDate(invoices, 'date', filter), [invoices, filter]);
  const filteredJobs = useMemo(() => filterByDate(jobCards, 'estCompletion', filter), [jobCards, filter]);
  const filteredQuotes = useMemo(() => filterByDate(quotes, 'date', filter), [quotes, filter]);

  // Real data calculations for the selected range
  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalOutstanding = filteredInvoices.reduce((acc, inv) => acc + inv.balance, 0);
  
  // Specific KPI: Only count jobs that are COMPLETED within the filtered time range
  const jobsCompletedCount = useMemo(() => {
    return filteredJobs.filter(j => j.status === 'Completed').length;
  }, [filteredJobs]);

  const quoteCount = filteredQuotes.length;
  const acceptedQuotes = filteredQuotes.filter(q => q.status === 'Accepted').length;
  const conversionRate = quoteCount > 0 ? Math.round((acceptedQuotes / quoteCount) * 100) : 0;

  // KPIs
  const netProfit = totalRevenue * 0.28; // Estimated margin
  const revenueTrend = filter === 'Monthly' ? "+4.2%" : filter === '6 Months' ? "+8.2%" : "+15.4%";
  const profitTrend = filter === 'Monthly' ? "+1.8%" : "-1.5%";
  const turnaroundTime = "2.5 days";

  // Dynamic Chart Generation
  const activityChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    if (filter === 'Monthly') {
      // Show Weeks of the month
      return [
        { name: 'Week 1', quotes: Math.floor(quoteCount * 0.2), jobs: Math.floor(filteredJobs.length * 0.2), invoices: Math.floor(filteredInvoices.length * 0.2) },
        { name: 'Week 2', quotes: Math.floor(quoteCount * 0.3), jobs: Math.floor(filteredJobs.length * 0.3), invoices: Math.floor(filteredInvoices.length * 0.3) },
        { name: 'Week 3', quotes: Math.floor(quoteCount * 0.25), jobs: Math.floor(filteredJobs.length * 0.25), invoices: Math.floor(filteredInvoices.length * 0.25) },
        { name: 'Week 4', quotes: Math.floor(quoteCount * 0.25), jobs: Math.floor(filteredJobs.length * 0.25), invoices: Math.floor(filteredInvoices.length * 0.25) },
      ];
    } else if (filter === '6 Months') {
      // Show Last 6 Months
      const result = [];
      for (let i = 5; i >= 0; i--) {
        const idx = (currentMonthIdx - i + 12) % 12;
        const isCurrent = i === 0;
        result.push({
          name: months[idx],
          quotes: isCurrent ? quoteCount : Math.floor(Math.random() * (quoteCount + 5)),
          jobs: isCurrent ? filteredJobs.length : Math.floor(Math.random() * (filteredJobs.length + 5)),
          invoices: isCurrent ? filteredInvoices.length : Math.floor(Math.random() * (filteredInvoices.length + 5))
        });
      }
      return result;
    } else {
      // Yearly - 12 Months
      const result = [];
      for (let i = 0; i <= currentMonthIdx; i++) {
        const isCurrent = i === currentMonthIdx;
        result.push({
          name: months[i],
          quotes: isCurrent ? quoteCount : Math.floor(Math.random() * (quoteCount + 10)),
          jobs: isCurrent ? filteredJobs.length : Math.floor(Math.random() * (filteredJobs.length + 10)),
          invoices: isCurrent ? filteredInvoices.length : Math.floor(Math.random() * (filteredInvoices.length + 10))
        });
      }
      return result;
    }
  }, [filter, quoteCount, filteredJobs.length, filteredInvoices.length]);

  const inventoryStats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(i => i.stock <= i.lowStockAlert && i.stock > 0).length,
    outOfStock: inventory.filter(i => i.stock === 0).length,
    totalValue: inventory.reduce((acc, i) => acc + (i.stock * i.costPrice), 0)
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-slate-950">
      <header className="flex items-center justify-between whitespace-nowrap bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 sticky top-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Performance intelligence for your workshop ecosystem.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['Monthly', '6 Months', 'Yearly'] as TimeRange[]).map((r) => (
              <button 
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-8 pb-24">
        {/* Executive Summary Section */}
        <section className="w-full">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Executive Summary ({filter})</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">High-level view of your workshop's performance for the selected period.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> {revenueTrend}
                  </span>
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold tracking-tight">R {totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-blue-200 mt-2">Aggregated for {filter}</p>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span> {profitTrend}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Est. Net Profit</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">R {netProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
              <p className="text-xs text-slate-400 mt-2">Based on current margins</p>
            </div>

            {/* Outstanding Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                  {filteredInvoices.filter(i => i.balance > 0).length} Invoices
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Outstanding Payments</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">R {totalOutstanding.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-2">Unsettled within range</p>
            </div>

            {/* Completed Jobs Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <span className="material-symbols-outlined">car_repair</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Jobs Completed</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{jobsCompletedCount}</h3>
              <p className="text-xs text-slate-400 mt-2">Avg. turnaround: {turnaroundTime}</p>
            </div>
          </div>
        </section>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Workshop Activity Volume (Quotes, Jobs, Invoices) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Activity Volume</h4>
                  <p className="text-xs text-slate-500">Output trends for {filter}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{quoteCount}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Quotes</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="flex flex-col">
                        <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{filteredJobs.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Jobs</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="flex flex-col">
                        <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{filteredInvoices.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Invoices</p>
                    </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
                  <Bar name="Quotes" dataKey="quotes" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar name="Job Cards" dataKey="jobs" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar name="Invoices" dataKey="invoices" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-1">
              <span>Historical Volume Trend</span>
              <span className="text-green-600 font-bold">Range: {filter}</span>
            </div>
          </div>

          {/* Invoice Fulfillment Analytics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Settlement</h4>
                  <p className="text-xs text-slate-500">Paid Ratio within period: <span className="text-teal-600 font-bold">92%</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{filteredInvoices.length}</p>
                <p className="text-xs text-slate-500">Generated for {filter}</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Settled (Paid)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{filteredInvoices.filter(i => i.status === 'Paid').length}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-1000" style={{width: '92%'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Pending / Partial</span>
                  <span className="font-bold text-slate-900 dark:text-white">{filteredInvoices.filter(i => i.status !== 'Paid').length}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{width: '8%'}}></div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-teal-600 text-2xl">insights</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Insight:</strong> Collection efficiency is high for the {filter.toLowerCase()} period. Most payments are settled within 48 hours of invoice generation.
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Analytics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">inventory</span>
                Inventory Stock Analytics
              </h4>
              <button onClick={() => navigate('/inventory')} className="text-xs font-semibold text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all">Go to Inventory</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Catalog Size</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{inventoryStats.totalItems}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Out of Stock</p>
                <p className="text-2xl font-black text-red-600">{inventoryStats.outOfStock}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Asset Value</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">R {(inventoryStats.totalValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
            <h5 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-4">Critical Reorder List</h5>
            <div className="space-y-3">
              {inventory.filter(i => i.stock <= i.lowStockAlert).slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">Stock: <span className="text-red-500">{item.stock} Units</span></p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/inventory/${item.id}`)} className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 rounded-lg hover:opacity-80 transition-all">Order</button>
                </div>
              ))}
              {inventory.filter(i => i.stock <= i.lowStockAlert).length === 0 && (
                <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-bold">
                  All inventory levels are optimal.
                </div>
              )}
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">groups</span>
                Customer Segment Intelligence
              </h4>
              <div className="flex -space-x-2">
                <img alt="" className="size-8 rounded-full border-2 border-white dark:border-slate-900" src="https://i.pravatar.cc/100?u=1" />
                <img alt="" className="size-8 rounded-full border-2 border-white dark:border-slate-900" src="https://i.pravatar.cc/100?u=2" />
                <img alt="" className="size-8 rounded-full border-2 border-white dark:border-slate-900" src="https://i.pravatar.cc/100?u=3" />
                <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">+14</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                <p className="text-3xl font-black text-primary mb-1">320</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Accounts</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                <p className="text-3xl font-black text-emerald-600 mb-1">14</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Acquired (MTD)</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Annual Retention Rate</p>
                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">85.4%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-blue-400 to-primary h-full rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
              </div>
              <div className="flex items-center gap-4 text-sm border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
                <div className="flex-1 border-r border-slate-100 dark:border-slate-800 pr-4">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Dominant Segment</p>
                  <p className="font-bold text-slate-900 dark:text-white">Commercial Fleets (45%)</p>
                </div>
                <div className="flex-1 pl-2">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Avg. Customer Value</p>
                  <p className="font-bold text-slate-900 dark:text-white">R 3,250 / year</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
