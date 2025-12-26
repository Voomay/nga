
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { customers, deleteCustomer } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const isOwner = user?.role === 'Owner';

  const filteredCustomers = customers.filter(customer => 
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full pb-20">
      <div className="flex flex-col gap-6">
        {/* Page Header & Main Actions */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="hover:text-primary transition-colors">Dashboard</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-main font-medium">Customers</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">Customer Directory</h1>
              <p className="text-text-muted text-base font-normal leading-normal">Manage your client base, view history, and create new jobs.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-surface-card border border-border-light text-text-main hover:bg-background-light text-sm font-bold leading-normal transition-colors gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={() => navigate('/customers/create')}
                className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white hover:bg-primary-hover text-sm font-bold leading-normal transition-colors gap-2 shadow-sm shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>Add New Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Total Customers</p>
            <p className="text-text-main tracking-tight text-3xl font-black leading-tight">{customers.length}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">New This Month</p>
            <div className="flex items-baseline gap-2">
                <p className="text-text-main tracking-tight text-3xl font-black leading-tight">4</p>
                <span className="text-emerald-600 text-xs font-bold">+12%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Loyal Clients</p>
            <p className="text-text-main tracking-tight text-3xl font-black leading-tight">18</p>
          </div>
          {isOwner ? (
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-slate-900 text-white shadow-md">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Receivables</p>
              <p className="text-white tracking-tight text-2xl font-black leading-tight truncate">
                  R {customers.reduce((acc, c) => acc + (c.balance || 0), 0).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-surface-card border border-border-light border-dashed text-center items-center justify-center">
                <span className="material-symbols-outlined text-text-muted/30">lock</span>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Financials Hidden</p>
            </div>
          )}
        </div>

        {/* Search and Filters Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-card p-3 rounded-xl border border-border-light shadow-sm">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg leading-5 bg-background-light text-text-main placeholder-text-muted focus:outline-none focus:bg-surface-card focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
              placeholder="Search name, email, or company..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="flex shrink-0 items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-border-light hover:bg-background-light text-text-main text-sm font-medium transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Status: All
             </button>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-surface-card border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-full">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Customer Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Contact Info</th>
                  <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Primary Vehicle</th>
                  {isOwner && <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Balance</th>}
                  <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light bg-surface-card">
                {filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-background-light transition-colors group cursor-pointer"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shadow-md shadow-primary/10">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-main font-bold text-sm group-hover:text-primary transition-colors">{customer.firstName} {customer.lastName}</span>
                          {customer.isBusiness && <span className="text-text-muted text-[11px] font-bold uppercase tracking-tight">{customer.companyName}</span>}
                          <span className="text-xs text-text-muted md:hidden">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex flex-col">
                        <div className="text-sm text-text-main font-medium">{customer.phone}</div>
                        <div className="text-xs text-text-muted">{customer.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      {customer.vehicles && customer.vehicles.length > 0 ? (
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-text-muted text-[18px]">directions_car</span>
                           <span className="text-xs font-bold text-text-main bg-slate-100 px-2 py-1 rounded">{customer.vehicles[0]}</span>
                           {customer.vehicles.length > 1 && <span className="text-[10px] text-text-muted font-bold">+{customer.vehicles.length - 1} more</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">No vehicles linked</span>
                      )}
                    </td>
                    {isOwner && (
                      <td className="py-4 px-6 text-right">
                        <div className={`text-sm font-black ${customer.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {customer.balance > 0 ? `R ${customer.balance.toLocaleString()}` : 'R 0.00'}
                        </div>
                        {customer.balance > 0 && <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">Overdue</div>}
                      </td>
                    )}
                    <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                className="text-text-muted hover:text-primary p-1.5 rounded hover:bg-primary/5 transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`); }}
                                title="View Details"
                            >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button 
                                className="text-text-muted hover:text-primary p-1.5 rounded hover:bg-primary/5 transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}/edit`); }}
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            {isOwner && (
                              <button 
                                  className="text-text-muted hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); if(confirm('Delete customer?')) deleteCustomer(customer.id); }}
                                  title="Delete"
                              >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )}
                        </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-20 text-center text-text-muted">
                            <span className="material-symbols-outlined text-4xl opacity-20 mb-2 block">group_off</span>
                            <p className="font-bold">No customers match your search.</p>
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
