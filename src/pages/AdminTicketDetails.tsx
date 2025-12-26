
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const AdminTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, updateTicket } = useData();
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [message, setMessage] = useState('');

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return <div className="p-20 text-center">Ticket not found.</div>;
  }

  const handleSendReply = () => {
    if (!message.trim()) return;

    const now = new Date().toISOString();
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: 'Admin Support',
      role: replyMode === 'public' ? 'Admin' as const : 'Admin' as const, // For mock, internal notes could be a message sub-type
      content: message,
      timestamp: now
    };

    const updatedTicket = {
      ...ticket,
      updatedAt: now,
      status: replyMode === 'public' ? 'Pending Response' as const : ticket.status,
      messages: [...ticket.messages, newMessage]
    };

    updateTicket(updatedTicket);
    setMessage('');
  };

  const handleStatusChange = (newStatus: any) => {
    const updatedTicket = { ...ticket, status: newStatus, updatedAt: new Date().toISOString() };
    updateTicket(updatedTicket);
  };

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
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors w-full text-left">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">support_agent</span>
            <span className="text-sm font-bold">Support Tickets</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/admin/support')} className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ticket #{ticket.id}</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:px-10 lg:py-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{ticket.subject}</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">{ticket.status}</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Workshop: {ticket.workshopName} • Submitter: {ticket.userName}</p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => handleStatusChange('Resolved')} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl text-red-600 text-sm font-bold hover:bg-red-50 transition-all shadow-sm">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Mark Resolved</span>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 flex flex-col gap-6">
                {ticket.messages.map((msg) => (
                  <div key={msg.id} className={`bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${msg.role === 'Admin' ? 'ml-12 border-primary/20' : 'mr-12'}`}>
                    <div className={`p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between ${msg.role === 'Admin' ? 'bg-primary/5' : 'bg-slate-50/50'}`}>
                      <span className="text-xs font-black uppercase text-slate-500">{msg.senderName} ({msg.role})</span>
                      <span className="text-[10px] font-bold text-slate-400 tabular-nums">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {ticket.status !== 'Resolved' && (
                  <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 overflow-hidden mt-6">
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                      <button onClick={() => setReplyMode('public')} className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${replyMode === 'public' ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-400'}`}>Public Reply</button>
                    </div>
                    <div className="p-6">
                      <textarea className="w-full min-h-[160px] bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-300 text-sm font-medium resize-none" placeholder="Type your response to the workshop owner..." value={message} onChange={e => setMessage(e.target.value)}></textarea>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button onClick={handleSendReply} className="px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">Send Reply</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Properties</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase">Update Status</label>
                      <select onChange={(e) => handleStatusChange(e.target.value)} value={ticket.status} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold py-3 px-4">
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending Response">Pending Response</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
