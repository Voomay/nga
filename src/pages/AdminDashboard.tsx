
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tickets } = useData();

  const hasAwaitingSupport = tickets.some(t => t.status === 'Open');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-200">
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
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">dashboard</span>
            <span className="text-sm font-bold">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">payments</span>
            <span className="text-sm font-medium">Member Subscriptions</span>
          </button>
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">credit_card</span>
            <span className="text-sm font-medium">Billing Settings</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left relative">
            <div className="relative">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors">support_agent</span>
              {hasAwaitingSupport && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-flicker"></span>
                </span>
              )}
            </div>
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

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center bg-[#f2f0f4] dark:bg-white/5 rounded-lg h-10 w-64 lg:w-96 px-3 border border-transparent focus-within:border-[#0d51b0]/50 focus-within:ring-2 focus-within:ring-[#0d51b0]/10 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400" placeholder="Search workshops, users, invoices..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 relative transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-card-dark"></span>
            </button>
            <button className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Welcome back, Admin</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Here's what's happening on the platform today.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-gray-700 shadow-sm">
                  <span className="inline-block size-2 rounded-full bg-green-500 mr-2"></span> System Operational
                </span>
                <button onClick={() => navigate('/admin/users')} className="bg-[#0d51b0] hover:bg-[#0d51b0]/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#0d51b0]/25 transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span> New Platform User
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-[#e0dbe6] dark:border-gray-800 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">garage</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">+5%</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Workshops</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142</p>
                </div>
              </div>
              <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-[#e0dbe6] dark:border-gray-800 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400 px-2 py-1 rounded-full">Action Req.</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
                </div>
              </div>
              <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-[#e0dbe6] dark:border-gray-800 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-[#0d51b0] dark:text-purple-300">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">+12%</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R 85,400</p>
                </div>
              </div>
              <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-[#e0dbe6] dark:border-gray-800 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined">error</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400 px-2 py-1 rounded-full">Stable</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">System Errors</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button onClick={() => navigate('/admin/users')} className="flex items-center p-4 bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl hover:border-[#0d51b0]/50 dark:hover:border-[#0d51b0]/50 hover:shadow-md transition-all group text-left">
                  <div className="size-12 rounded-lg bg-[#0d51b0]/5 flex items-center justify-center text-[#0d51b0] group-hover:bg-[#0d51b0] group-hover:text-white transition-colors mr-4">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">User Management</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Owners & platform users</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#0d51b0] transition-colors">chevron_right</span>
                </button>
                <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center p-4 bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl hover:border-[#0d51b0]/50 dark:hover:border-[#0d51b0]/50 hover:shadow-md transition-all group text-left">
                  <div className="size-12 rounded-lg bg-[#0d51b0]/5 flex items-center justify-center text-[#0d51b0] group-hover:bg-[#0d51b0] group-hover:text-white transition-colors mr-4">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Member Subscriptions</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage workshop payments</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#0d51b0] transition-colors">chevron_right</span>
                </button>
                <button onClick={() => navigate('/admin/billing')} className="flex items-center p-4 bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl hover:border-[#0d51b0]/50 dark:hover:border-[#0d51b0]/50 hover:shadow-md transition-all group text-left">
                  <div className="size-12 rounded-lg bg-[#0d51b0]/5 flex items-center justify-center text-[#0d51b0] group-hover:bg-[#0d51b0] group-hover:text-white transition-colors mr-4">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Billing Settings</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Plans & subscriptions</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#0d51b0] transition-colors">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Split View: Recent Users & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-5 border-b border-[#e0dbe6] dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <h3 className="font-bold text-slate-900 dark:text-white">Recent Workshop Registrations</h3>
                  <a className="text-sm font-semibold text-[#0d51b0] hover:text-[#0d51b0]/80" href="#">View All</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Platform User</th>
                        <th className="px-6 py-3 font-semibold">Workshop</th>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0dbe6] dark:divide-gray-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#0d51b0]/20 flex items-center justify-center text-[#0d51b0] text-xs font-bold">JS</div>
                          J. Smith (Owner)
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Cape Town Mechanics</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#0d51b0] font-bold hover:underline">Review</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">SN</div>
                          S. Nkosi (Owner)
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Durban Auto Fix</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">Oct 23, 2023</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#0d51b0] font-bold hover:underline">Review</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white dark:bg-card-dark border border-[#e0dbe6] dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">System Health</h3>
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Server CPU Load</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">24%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-[#0d51b0] h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database Storage</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">65%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-[#0d51b0] h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-[#e0dbe6] dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    <span className="material-symbols-outlined text-sm">dns</span>
                    <span>Server Uptime</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">14d 2h 45m</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 border-t border-[#e0dbe6] dark:border-gray-800 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
              <p>© 2024 AutoFix Pro - AutoDoc Systems. All rights reserved.</p>
              <div className="flex gap-4 mt-2 md:mt-0">
                <a className="hover:text-[#0d51b0] transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-[#0d51b0] transition-colors" href="#">Terms of Service</a>
                <a className="hover:text-[#0d51b0] transition-colors" href="#">Support</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
