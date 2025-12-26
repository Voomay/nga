
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const AdminSupport: React.FC = () => {
  const navigate = useNavigate();
  const { tickets } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const hasAwaitingSupport = tickets.some(t => t.status === 'Open');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.workshopName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200">
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-card-dark border-r border-[#e0dbe6] dark:border-gray-800 transition-colors duration-200 flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"><span className="material-symbols-outlined text-[24px]">directions_car</span></div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">AutoDoc</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">payments</span>
            <span className="text-sm font-medium">Member Subscriptions</span>
          </button>
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined">credit_card</span>
            <span className="text-sm font-medium">Billing Settings</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left relative">
            <div className="relative">
              <span className="material-symbols-outlined icon-fill">support_agent</span>
              {hasAwaitingSupport && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-flicker"></span>
                </span>
              )}
            </div>
            <span className="text-sm font-bold">Support Tickets</span>
          </button>
          <button onClick={() => navigate('/admin/landing-page')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined">auto_fix_high</span>
            <span className="text-sm font-medium">Landing Page Editor</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#e0dbe6] dark:border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => navigate('/')}>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=Admin&background=0d51b0&color=fff')" }}></div>
            <div className="flex flex-col"><p className="text-sm font-bold truncate">Admin Root</p><p className="text-xs text-slate-500">admin@autodoc.co.za</p></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-[#f2f0f4] dark:bg-white/5 rounded-lg h-10 w-96 px-3 border border-transparent focus-within:border-primary/50 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-slate-200" placeholder="Search ID, Subject, or Workshop..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">System Tickets</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Oversee all platform-wide support requests.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white dark:bg-[#111a22] shadow-sm">
                <p className="text-slate-500 text-sm font-medium">Awaiting Reply</p>
                <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">{tickets.filter(t => t.status === 'Open').length}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white dark:bg-[#111a22] shadow-sm">
                <p className="text-slate-500 text-sm font-medium">In Progress</p>
                <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">{tickets.filter(t => t.status === 'In Progress').length}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white dark:bg-[#111a22] shadow-sm">
                <p className="text-slate-500 text-sm font-medium">Resolved This Week</p>
                <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">{tickets.filter(t => t.status === 'Resolved').length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Workshop</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Subject</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/support/${ticket.id}`)}>
                        <td className="py-4 px-6"><span className="text-primary font-bold">#{ticket.id}</span></td>
                        <td className="py-4 px-6"><div className="flex flex-col"><span className="text-slate-900 dark:text-white font-medium text-sm">{ticket.workshopName}</span><span className="text-slate-500 text-xs">{ticket.userName}</span></div></td>
                        <td className="py-4 px-6"><p className="text-slate-900 dark:text-white text-sm font-medium truncate max-w-xs">{ticket.subject}</p></td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            ticket.priority === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                            ticket.priority === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>{ticket.priority}</span>
                        </td>
                        <td className="py-4 px-6">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                            ticket.status === 'In Progress' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>{ticket.status}</span>
                        </td>
                        <td className="py-4 px-6 text-right"><span className="text-slate-600 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
