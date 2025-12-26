
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../context/AuthContext';

export const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const usersStr = localStorage.getItem('autofix_users_db');
    if (usersStr) {
      setUsers(JSON.parse(usersStr));
    }
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.workshopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200">
      
      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 pb-4 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="px-10 pb-12 flex flex-col items-center text-center">
              <div className="size-24 rounded-full border-4 border-primary/10 p-1 mb-6">
                <img 
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=0d51b0&color=fff`} 
                  className="w-full h-full rounded-full object-cover shadow-sm" 
                  alt="Profile" 
                />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedUser.name}</h3>
              <p className="text-primary font-bold text-sm uppercase tracking-[0.15em] mt-1">{selectedUser.role}</p>
              
              <div className="w-full mt-10 space-y-6">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Workshop Identity</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">{selectedUser.workshopName}</span>
                </div>
                
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{selectedUser.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-l border-slate-100 dark:border-white/5 pl-8 text-left">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Contact</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedUser.workshopPhone || 'Not Set'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 w-full">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-card-dark border-r border-[#e0dbe6] dark:border-gray-800 transition-colors duration-200 flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[24px]">directions_car</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">AutoDoc</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">group</span>
            <span className="text-sm font-bold">User Management</span>
          </button>
          <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">payments</span>
            <span className="text-sm font-medium">Member Subscriptions</span>
          </button>
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">credit_card</span>
            <span className="text-sm font-medium">Billing Settings</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">support_agent</span>
            <span className="text-sm font-medium">Support Tickets</span>
          </button>
          <button onClick={() => navigate('/admin/landing-page')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">auto_fix_high</span>
            <span className="text-sm font-medium">Landing Page Editor</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#e0dbe6] dark:border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate('/')}>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Admin&background=0d51b0&color=fff")'}}></div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-bold truncate">SysAdmin Root</p>
              <p className="text-xs text-slate-500 truncate">admin@autodoc.co.za</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center bg-[#f2f0f4] dark:bg-white/5 rounded-lg h-10 w-64 lg:w-96 px-3 border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400" 
                placeholder="Global Search..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 relative transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-card-dark"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Platform Users</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manage workshop owners and platform administrators.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all">
                  <span className="material-symbols-outlined text-[18px]">person_add</span> Add New Platform User
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5 dark:text-slate-400 border-b border-[#e0dbe6] dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-bold tracking-wider">Platform User</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Workshop Detail</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Contact</th>
                      <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0dbe6] dark:divide-gray-800">
                    {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden shadow-sm flex items-center justify-center">
                              {u.avatar ? (
                                <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} />
                              ) : (
                                <span className="font-bold text-xs">{u.name.substring(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {u.id.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            u.role === 'Owner' 
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-900/30'
                              : 'bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-300 border-slate-100 dark:border-gray-700'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {u.role === 'Owner' ? 'manage_accounts' : 'person'}
                            </span> {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-bold">{u.workshopName}</td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{u.email}</span>
                                <span className="text-[10px] text-slate-500">{u.workshopPhone || 'No Phone Set'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                              className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-colors" 
                              title="View Profile"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                          <p className="font-bold">No platform users found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <footer className="mt-4 border-t border-[#e0dbe6] dark:border-gray-800 pt-6 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
              <p>© 2024 AutoFix Pro - AutoDoc Systems. All rights reserved.</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
