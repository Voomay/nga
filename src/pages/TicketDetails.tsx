
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, updateTicket } = useData();
  const [replyText, setReplyText] = useState('');

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return <div className="p-20 text-center">Ticket not found.</div>;
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !user) return;
    
    const now = new Date().toISOString();
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: user.name,
      role: 'Owner' as const,
      content: replyText,
      timestamp: now
    };

    const updatedTicket = {
      ...ticket,
      updatedAt: now,
      status: ticket.status === 'Pending Response' ? 'Open' : ticket.status,
      messages: [...ticket.messages, newMessage]
    };

    updateTicket(updatedTicket);
    setReplyText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <header className="flex-shrink-0 bg-background-light px-4 md:px-8 pt-6 pb-4 border-b border-border-light">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <nav className="flex items-center text-sm font-medium text-text-muted">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Home</button>
            <span className="mx-2 text-border-light">/</span>
            <button onClick={() => navigate('/support')} className="hover:text-primary transition-colors">Support</button>
            <span className="mx-2 text-border-light">/</span>
            <span className="text-text-main font-bold">#{ticket.id}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-text-main text-2xl md:text-3xl font-black tracking-tight leading-tight">{ticket.subject}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Created on {new Date(ticket.createdAt).toLocaleString()} • Category: {ticket.category}
              </p>
            </div>
            <button onClick={() => navigate('/support')} className="px-4 py-2 bg-surface-card border border-border-light text-text-main rounded-xl text-sm font-bold">Back to List</button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {ticket.messages.map((msg) => (
            <div key={msg.id} className={`bg-surface-card rounded-2xl border border-border-light shadow-sm overflow-hidden ${msg.role === 'Admin' ? 'ml-12 bg-primary/5' : 'mr-12'}`}>
              <div className={`px-6 py-3 border-b border-border-light flex justify-between items-center ${msg.role === 'Admin' ? 'bg-primary/5' : 'bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                   <div className={`size-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${msg.role === 'Admin' ? 'bg-primary' : 'bg-slate-400'}`}>
                     {msg.senderName.substring(0,2).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-black text-text-main">{msg.senderName}</p>
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{msg.role}</p>
                   </div>
                </div>
                <span className="text-[10px] font-black text-text-muted uppercase tabular-nums">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="p-6">
                <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
              </div>
            </div>
          ))}

          {ticket.status !== 'Resolved' && (
            <div className="bg-surface-card rounded-2xl border border-border-light shadow-lg overflow-hidden mt-6">
              <div className="p-6">
                <textarea 
                  className="w-full rounded-2xl border-border-light bg-background-light/50 text-sm font-medium text-text-main p-4 resize-none focus:ring-primary focus:border-primary" 
                  placeholder="Type your follow-up message here..." 
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleSendReply} className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Send Reply</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
