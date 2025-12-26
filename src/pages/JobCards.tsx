
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const JobCards: React.FC = () => {
  const navigate = useNavigate();
  const { jobCards, deleteJobCard } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isOwner = user?.role === 'Owner';

  const filteredJobs = jobCards.filter(job => {
    const matchesSearch = 
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background-light">
      <div className="layout-container flex flex-col max-w-[1400px] mx-auto w-full p-4 md:p-8 gap-6 pb-20">
        
        {/* Breadcrumbs & Page Heading */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-1">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="hover:text-primary transition-colors">Dashboard</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-main font-medium">Job Cards</span>
          </div>
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">Job Cards</h1>
              <p className="text-text-muted text-base font-normal leading-normal">Manage active repairs and workshop schedule.</p>
            </div>
            <button 
              onClick={() => navigate('/job-cards/create')}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Job Card</span>
            </button>
          </div>
        </div>

        {/* Stats Overview - Mirrored from Invoice Stats Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => setStatusFilter('Booked')} className={`flex flex-col gap-2 rounded-xl p-5 border shadow-sm transition-all cursor-pointer ${statusFilter === 'Booked' ? 'bg-background-light border-primary ring-1 ring-primary' : 'bg-surface-card border-border-light hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start">
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Booked</p>
              <span className="material-symbols-outlined text-text-muted opacity-50 text-[20px]">calendar_today</span>
            </div>
            <p className="text-text-main text-2xl font-black">{jobCards.filter(j => j.status === 'Booked').length}</p>
          </div>
          <div onClick={() => setStatusFilter('In Progress')} className={`flex flex-col gap-2 rounded-xl p-5 border shadow-sm transition-all cursor-pointer ${statusFilter === 'In Progress' ? 'bg-background-light border-primary ring-1 ring-primary' : 'bg-surface-card border-border-light hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start">
              <p className="text-primary text-[10px] font-bold uppercase tracking-wider">In Progress</p>
              <span className="material-symbols-outlined text-primary text-[20px]">build</span>
            </div>
            <p className="text-text-main text-2xl font-black">{jobCards.filter(j => j.status === 'In Progress').length}</p>
          </div>
          <div onClick={() => setStatusFilter('Waiting Parts')} className={`flex flex-col gap-2 rounded-xl p-5 border shadow-sm transition-all cursor-pointer ${statusFilter === 'Waiting Parts' ? 'bg-background-light border-primary ring-1 ring-primary' : 'bg-surface-card border-border-light hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start">
              <p className="text-amber-600 text-[10px] font-bold uppercase tracking-wider">Waiting Parts</p>
              <span className="material-symbols-outlined text-amber-500 text-[20px]">inventory</span>
            </div>
            <p className="text-text-main text-2xl font-black">{jobCards.filter(j => j.status === 'Waiting Parts').length}</p>
          </div>
          <div onClick={() => setStatusFilter('Completed')} className={`flex flex-col gap-2 rounded-xl p-5 border shadow-sm transition-all cursor-pointer ${statusFilter === 'Completed' ? 'bg-background-light border-primary ring-1 ring-primary' : 'bg-surface-card border-border-light hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start">
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Completed</p>
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            </div>
            <p className="text-text-main text-2xl font-black">{jobCards.filter(j => j.status === 'Completed').length}</p>
          </div>
        </div>

        {/* Search & Filter Bar - Identical to Invoices.tsx */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-card p-3 rounded-xl border border-border-light shadow-sm">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg leading-5 bg-background-light text-text-main placeholder-text-muted focus:outline-none focus:bg-surface-card focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
              placeholder="Search ID, customer, or vehicle..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="relative">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none flex shrink-0 items-center gap-2 pl-3 pr-8 py-2 rounded-lg bg-surface-card border border-border-light hover:bg-background-light text-text-main text-sm font-medium transition-colors cursor-pointer focus:ring-primary focus:border-primary"
                >
                    <option value="All">Status: All</option>
                    <option value="Booked">Booked</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting Parts">Waiting Parts</option>
                    <option value="Completed">Completed</option>
                </select>
                <span className="material-symbols-outlined text-[20px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">expand_more</span>
            </div>
            
            <button className="flex shrink-0 items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-border-light hover:bg-background-light text-text-main text-sm font-medium transition-colors" title="Export List">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Job Cards Table - Mirrored from Invoices Table Style */}
        <div className="bg-surface-card border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-background-light border-b border-border-light">
                  <th className="py-4 px-4 md:px-6 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">Job #</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Vehicle</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Technician</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Progress</th>
                  <th className="py-4 px-6 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredJobs.map((job) => (
                  <tr 
                    key={job.id}
                    onClick={() => navigate(`/job-cards/${job.id}`)}
                    className="hover:bg-background-light transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-4 md:px-6 text-sm font-bold text-text-main whitespace-nowrap">{job.jobId}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main truncate max-w-[180px]">{job.customerName}</span>
                        <span className="text-xs text-text-muted md:hidden">{job.vehicleName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm text-text-main">{job.vehicleName}</span>
                        <span className="text-[11px] font-bold text-text-muted tracking-wider uppercase opacity-80">{job.vehicleReg}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                        {job.technicianName === 'Unassigned' ? (
                            <span className="text-[13px] text-text-muted italic opacity-60">Not assigned</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-slate-100 border border-border-light overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.technicianName)}&background=random`} className="w-full h-full object-cover" alt="Tech" />
                                </div>
                                <span className="text-[13px] text-text-main font-medium">{job.technicianName}</span>
                            </div>
                        )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                        job.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                        job.status === 'Waiting Parts' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        job.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        job.status === 'In Progress' ? 'bg-primary' :
                                        job.status === 'Waiting Parts' ? 'bg-orange-500' :
                                        job.status === 'Completed' ? 'bg-green-500' :
                                        'bg-slate-400'
                                    }`} 
                                    style={{width: `${job.progress}%`}}
                                ></div>
                            </div>
                            <span className="text-[10px] font-black text-text-muted tracking-widest">{job.progress}%</span>
                        </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-primary/5"
                            onClick={(e) => { e.stopPropagation(); navigate(`/job-cards/${job.id}`); }}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            className="text-text-muted hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); deleteJobCard(job.id); }}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                    <tr>
                        <td colSpan={7} className="p-16 text-center text-text-muted">
                            <span className="material-symbols-outlined text-4xl opacity-20 mb-2 block">search_off</span>
                            <p className="text-sm font-bold">No job cards found matching your criteria.</p>
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
