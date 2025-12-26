import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, deleteInvoice } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isOwner = user?.role === 'Owner';

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background-light">
      <div className="layout-container flex flex-col max-w-[1400px] mx-auto w-full p-4 md:p-8 gap-6 pb-20">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">All Invoices</h1>
            <p className="text-text-muted text-base font-normal leading-normal">Manage your workshop billing and payment tracking.</p>
          </div>
          <button 
            onClick={() => navigate('/invoices/create')}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>New Invoice</span>
          </button>
        </div>

        {/* Stats Cards - Owner Only */}
        {isOwner && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-text-muted text-sm font-semibold uppercase tracking-wider">Total Billed</p>
                <span className="material-symbols-outlined text-text-muted opacity-50">payments</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-primary text-3xl font-extrabold leading-tight">
                  R {invoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-text-muted text-sm font-semibold uppercase tracking-wider">Outstanding Balance</p>
                <span className="material-symbols-outlined text-text-muted opacity-50">account_balance_wallet</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-text-main text-3xl font-extrabold leading-tight">
                  R {invoices.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-text-muted text-sm font-semibold uppercase tracking-wider">Overdue Invoices</p>
                <span className="material-symbols-outlined text-text-muted opacity-50">schedule</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-text-main text-3xl font-extrabold leading-tight">{invoices.filter(i => i.status === 'Overdue').length}</p>
                <p className="text-[#e73908] text-sm font-medium leading-normal">Requires action</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-card p-3 rounded-xl border border-border-light shadow-sm">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg leading-5 bg-background-light text-text-main placeholder-text-muted focus:outline-none focus:bg-surface-card focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
              placeholder="Search customer, vehicle, or invoice #" 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="relative">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none flex shrink-0 items-center gap-2 pl-3 pr-8 py-2 rounded-lg bg-surface-card border border-border-light hover:bg-background-light text-text-main text-sm font-medium transition-colors cursor-pointer focus:ring-primary focus:border-primary"
                >
                    <option value="All">Status: All</option>
                    <option value="Paid">Paid</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Sent">Sent</option>
                </select>
                <span className="material-symbols-outlined text-[20px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">expand_more</span>
            </div>
            
            <button className="flex shrink-0 items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-border-light hover:bg-background-light text-text-main text-sm font-medium transition-colors" title="Export to CSV">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-surface-card border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-background-light border-b border-border-light">
                  <th className="py-4 px-4 md:px-6 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">Invoice #</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Vehicle</th>
                  {isOwner && <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Amount</th>}
                  {isOwner && <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-right hidden md:table-cell">Balance</th>}
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-background-light transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-4 md:px-6 text-sm font-bold text-text-main whitespace-nowrap">{inv.number}</td>
                    <td className="py-4 px-6 text-sm text-text-main hidden md:table-cell">{inv.date}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-main truncate max-w-[150px]">{inv.customerName}</span>
                        <span className="text-xs text-text-muted md:hidden">{inv.vehicleMake}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm text-text-main">{inv.vehicleMake}</span>
                        <span className="text-xs text-text-muted">{inv.vehicleReg}</span>
                      </div>
                    </td>
                    {isOwner && <td className="py-4 px-6 text-sm font-bold text-text-main text-right whitespace-nowrap">R {inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>}
                    {isOwner && <td className="py-4 px-6 text-sm text-text-muted text-right hidden md:table-cell">R {inv.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium border ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                        inv.status === 'Partial' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        inv.status === 'Overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                        inv.status === 'Outstanding' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="text-text-muted hover:text-primary transition-colors p-1 rounded-full hover:bg-background-light"
                            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`); }}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          {isOwner && (
                            <button 
                              className="text-text-muted hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                              onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                    <tr>
                        <td colSpan={8} className="p-8 text-center text-text-muted">
                            No invoices found matching your criteria.
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