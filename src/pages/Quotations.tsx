
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, deleteQuote } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isOwner = user?.role === 'Owner';

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 pb-20">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <span>Workshop</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-text-main font-medium">Quotations</span>
            </div>
            <h1 className="text-text-main text-3xl md:text-4xl font-black tracking-tight">Quotations</h1>
            <p className="text-text-muted text-base font-normal max-w-2xl">Create, track and manage job estimates for your customers.</p>
          </div>
          <button 
            onClick={() => navigate('/quotations/create')}
            className="flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 group"
          >
            <span className="material-symbols-outlined font-bold group-hover:rotate-90 transition-transform">add</span>
            <span className="text-sm font-bold">New Quote</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-surface-card rounded-2xl p-4 border border-border-light shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="relative w-full xl:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted">search</span>
            <input 
              className="w-full bg-surface-card border border-border-light rounded-xl py-3 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
              placeholder="Search by quote #, customer or reg..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full xl:w-48 appearance-none bg-surface-card border border-border-light rounded-xl py-3 pl-4 pr-10 text-text-main text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-sm cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted pointer-events-none">expand_more</span>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-card hover:bg-background-light border border-border-light hover:border-primary text-text-muted hover:text-primary transition-colors shadow-sm" title="Export List">
              <span className="material-symbols-outlined text-[24px]">download</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border-light overflow-hidden bg-surface-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="border-b border-border-light bg-background-light">
                  <th className="p-4 pl-4 md:pl-6 text-xs font-bold uppercase tracking-wider text-text-muted w-24 md:w-32">Quote #</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-muted w-32 hidden md:table-cell">Date</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-muted">Customer</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-muted hidden md:table-cell">Vehicle</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-muted text-center">Status</th>
                  {isOwner && <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Amount</th>}
                  <th className="p-4 pr-6 text-xs font-bold uppercase tracking-wider text-text-muted text-right w-24 hidden md:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border-light">
                {filteredQuotes.map((quote) => (
                  <tr 
                    key={quote.id} 
                    onClick={() => navigate(`/quotations/${quote.id}`)}
                    className="group hover:bg-background-light transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-4 md:pl-6 font-semibold text-text-main group-hover:text-primary transition-colors whitespace-nowrap">{quote.number}</td>
                    <td className="p-4 text-text-muted hidden md:table-cell">{quote.date}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold truncate max-w-[150px]">{quote.customerName}</span>
                        <span className="text-xs text-text-muted md:hidden">{quote.vehicle}</span>
                        <span className="text-xs text-text-muted hidden md:block">{quote.customerPhone}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-background-light border border-border-light flex items-center justify-center text-text-muted">
                          <span className="material-symbols-outlined text-[18px]">directions_car</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-main font-medium">{quote.vehicle}</span>
                          <span className="text-xs text-text-muted bg-background-light px-1.5 rounded w-fit mt-0.5 border border-border-light">{quote.regNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                        quote.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {quote.status || 'Draft'}
                      </span>
                    </td>
                    {isOwner && <td className="p-4 text-right font-bold text-text-main tabular-nums whitespace-nowrap">R {quote.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>}
                    <td className="p-4 pr-6 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors" 
                          title="Edit"
                          onClick={(e) => { e.stopPropagation(); navigate(`/quotations/${quote.id}`); }}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {isOwner && (
                          <button 
                            className="p-2 rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors" 
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); deleteQuote(quote.id); }}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 7 : 6} className="p-8 text-center text-text-muted">
                      No quotations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
