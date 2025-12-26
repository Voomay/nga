
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SupportTicket } from '../types';

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, addTicket } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for new ticket
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Medium' as SupportTicket['priority'],
    description: ''
  });

  // Owners only see their own tickets
  const myTickets = tickets.filter(t => t.workshopId === user?.id || t.workshopName === user?.workshopName);

  const filteredTickets = myTickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const ticketId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const ticketPayload: SupportTicket = {
      id: ticketId,
      workshopId: user.id,
      workshopName: user.workshopName,
      userName: user.name,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      description: newTicket.description,
      messages: [
        {
          id: Math.random().toString(36).substr(2, 9),
          senderName: user.name,
          role: 'Owner',
          content: newTicket.description,
          timestamp: now
        }
      ]
    };

    addTicket(ticketPayload);
    setIsCreateModalOpen(false);
    setNewTicket({ subject: '', category: 'Technical', priority: 'Medium', description: '' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 md:p-8 lg:p-10 pb-20 transition-all">
      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-border-light flex items-center justify-between bg-surface-card sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-text-main">Create New Support Ticket</h2>
                <p className="text-sm text-text-muted">Fill in the details below to submit your request.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text-main hover:bg-background-light p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket} className="p-6 overflow-y-auto flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main" htmlFor="subject">Subject <span className="text-red-500">*</span></label>
                <input 
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-surface-card text-text-main placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold" 
                  id="subject" 
                  placeholder="Briefly summarize the issue" 
                  type="text"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-main" htmlFor="category">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-surface-card text-text-main appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer font-semibold" 
                      id="category"
                      value={newTicket.category}
                      onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                    >
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing & Payments</option>
                      <option value="Feature">Feature Request</option>
                      <option value="Account">Account Management</option>
                      <option value="Training">Training / How-to</option>
                      <option value="Inventory">Inventory System</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-main" htmlFor="priority">Priority <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-surface-card text-text-main appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer font-semibold" 
                      id="priority"
                      value={newTicket.priority}
                      onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                    >
                      <option value="Low">Low - General Question</option>
                      <option value="Medium">Medium - Minor Issue</option>
                      <option value="High">High - System Error</option>
                      <option value="Critical">Critical - Business Stoppage</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main" htmlFor="description">Description <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-card text-text-main placeholder:text-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm min-h-[140px] font-medium" 
                  id="description" 
                  placeholder="Please describe the issue in detail."
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="px-6 py-5 border-t border-border-light bg-background-light/30 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-border-light bg-surface-card text-text-main hover:bg-background-light text-sm font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-2">
                  <span>Submit Ticket</span>
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        <nav className="flex items-center text-sm font-medium text-text-muted">
          <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Home</button>
          <span className="mx-2 text-border-light">/</span>
          <span className="text-text-main font-bold">Support Tickets</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-main text-3xl font-black tracking-tight">Support Tickets</h1>
            <p className="text-text-muted text-base">View and manage your support inquiries.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm font-black uppercase tracking-widest group"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Create New Ticket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col gap-1">
            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Your Open Tickets</p>
            <p className="text-text-main text-4xl font-black">{myTickets.filter(t => t.status !== 'Resolved').length}</p>
          </div>
          <div className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col gap-1">
            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Unresolved Issues</p>
            <p className="text-text-main text-4xl font-black">{myTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}</p>
          </div>
          <div className="bg-surface-card p-6 rounded-2xl border border-border-light shadow-sm flex flex-col gap-1">
            <p className="text-text-muted text-xs font-black uppercase tracking-widest">Total History</p>
            <p className="text-text-main text-4xl font-black">{myTickets.length}</p>
          </div>
        </div>

        <div className="bg-surface-card p-4 rounded-2xl border border-border-light shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted"><span className="material-symbols-outlined">search</span></span>
            <input className="block w-full pl-12 pr-4 py-3 border-none bg-background-light rounded-xl text-text-main placeholder-text-muted focus:ring-2 focus:ring-primary/50 text-sm font-bold" placeholder="Search your tickets..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="bg-background-light border-none text-text-main text-sm font-black rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-primary/50 cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Open</option>
            <option>Pending Response</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div className="bg-surface-card rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-light/50 border-b border-border-light">
                  <th className="p-4 pl-6 text-[10px] font-black text-text-muted uppercase tracking-widest w-32">ID</th>
                  <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Subject</th>
                  <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Created</th>
                  <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="p-4 pr-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} onClick={() => navigate(`/support/${ticket.id}`)} className="group hover:bg-primary/5 transition-colors cursor-pointer">
                    <td className="p-4 pl-6"><span className="text-primary font-black text-sm">#{ticket.id}</span></td>
                    <td className="p-4"><p className="text-text-main font-bold text-sm leading-tight group-hover:text-primary transition-colors">{ticket.subject}</p></td>
                    <td className="p-4 text-xs font-bold text-text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        ticket.status === 'Pending Response' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        ticket.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-text-muted hover:text-primary p-2 rounded-full hover:bg-white border border-transparent hover:border-border-light shadow-none hover:shadow-sm transition-all">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center text-text-muted font-bold">No tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
