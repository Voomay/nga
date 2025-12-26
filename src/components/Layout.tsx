
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, User } from '../context/AuthContext';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';

const SidebarItem = ({ to, icon, label, filled = false, onClick, showDot = false, disabled = false }: { to: string; icon: string; label: string, filled?: boolean, onClick?: () => void, showDot?: boolean, disabled?: boolean }) => {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted opacity-40 cursor-not-allowed">
        <span className={`material-symbols-outlined ${filled ? 'icon-fill' : ''} text-[22px]`}>{icon}</span>
        <p className={`text-[15px] font-bold`}>{label}</p>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
          ? 'bg-primary/10 text-primary'
          : 'text-text-muted hover:bg-background-light hover:text-text-main'
        }`
      }
    >
      <div className="relative flex items-center justify-center">
        <span className={`material-symbols-outlined ${filled ? 'icon-fill' : ''} text-[22px]`}>{icon}</span>
        {showDot && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 animate-flicker"></span>
          </span>
        )}
      </div>
      <p className={`text-[15px] font-bold`}>{label}</p>
    </NavLink>
  );
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const { logo, name, theme, toggleTheme } = useWorkshop();
  const { tickets, billingAlert, paymentVerifications, getWorkshopSubscriptionStatus, adminConfig } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const isOwner = user?.role === 'Owner';

  // State for trial and lock status
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const status = getWorkshopSubscriptionStatus(user);

      // Calculate Trial Days for ribbon
      if (user.trialStartDate && !user.subscriptionPlanId) {
        const start = new Date(user.trialStartDate).getTime();
        const now = Date.now();
        const diffDays = 7 - (now - start) / (1000 * 60 * 60 * 24);
        setTrialDaysLeft(Math.max(0, Math.ceil(diffDays)));
      } else {
        setTrialDaysLeft(null);
      }

      // Check if locked
      if (status === 'Trial Expired' || status === 'Suspended' || (billingAlert?.isLocked)) {
        if (path !== '/billing') {
          setIsAccountLocked(true);
          setLockStatus(status);
        } else {
          setIsAccountLocked(false);
        }
      } else {
        setIsAccountLocked(false);
        setLockStatus(null);
      }
    }
  }, [user, billingAlert, path, getWorkshopSubscriptionStatus]);

  const currentWorkshopId = user?.ownerId || user?.id;
  const hasPendingVerification = paymentVerifications.some(p => p.workshopId === currentWorkshopId && p.status === 'Pending');

  const hasPendingSupport = tickets.some(t =>
    (t.workshopId === currentWorkshopId || t.workshopName === user?.workshopName) &&
    t.status === 'Pending Response'
  );

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-background-light">

      {/* Account Locked Overlay */}
      {isAccountLocked && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-300 border border-slate-100">
            <div className={`size-20 rounded-2xl flex items-center justify-center ${hasPendingVerification ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
              <span className={`material-symbols-outlined text-4xl ${hasPendingVerification ? 'animate-pulse' : ''}`}>
                {hasPendingVerification ? 'hourglass_top' : 'lock'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                {hasPendingVerification
                  ? 'Verification In Progress'
                  : lockStatus === 'Trial Expired' ? 'Trial Expired' : 'Service Suspended'}
              </h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                {hasPendingVerification
                  ? 'Your manual EFT proof is currently under review by our administrators. Access will be restored shortly once the payment is verified.'
                  : lockStatus === 'Trial Expired'
                    ? 'Your 7-day free trial has come to an end. To continue managing your workshop with AutoFix Pro, please finalize your subscription.'
                    : 'Access has been suspended due to an outstanding payment cycle. Settle your balance via manual EFT to reactivate your environment.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              {isOwner && !hasPendingVerification && (
                <button
                  onClick={() => navigate('/billing?intent=pay')}
                  className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  {lockStatus === 'Trial Expired' ? (adminConfig.showPricingInConsole ? 'Choose Plan' : 'View Subscription') : 'Pay & Reactivate'}
                </button>
              )}
              {isOwner && hasPendingVerification && (
                <button
                  onClick={() => navigate('/billing')}
                  className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 transition-all"
                >
                  View Payment Status
                </button>
              )}
              {!isOwner && (
                <p className="text-xs text-slate-400 font-bold italic mb-2">Please contact your workshop administrator to settle the account.</p>
              )}
              <button
                onClick={logout}
                className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[290px] h-full border-r border-border-light bg-surface-card flex flex-col transition-transform duration-300 ease-in-out lg:static lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden`}>
        <div className="flex flex-col h-full p-5">
          {/* Header / Brand */}
          <div className="flex flex-col gap-4 mb-8 px-2 mt-2 relative">
            <button
              onClick={closeSidebar}
              className="absolute -top-1 -right-1 lg:hidden p-2 rounded-full hover:bg-background-light text-text-muted transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div className="h-14 w-14 flex items-center justify-center bg-background-light rounded-xl p-2 shadow-sm border border-border-light overflow-hidden">
              <img
                src={logo}
                alt="Workshop Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-text-main text-[20px] font-black leading-tight tracking-tight truncate">{name}</h1>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Powered by AutoFix Pro</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/dashboard" icon="grid_view" label="Dashboard" filled={path === '/dashboard'} />
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/quotations" icon="description" label="Quotations" filled={path.includes('/quotations')} />
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/job-cards" icon="assignment" label="Job Cards" filled={path.includes('/job-cards')} />
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/invoices" icon="receipt_long" label="Invoices" filled={path.includes('/invoices')} />

            {isOwner && (
              <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/reports" icon="bar_chart" label="Financial Reports" filled={path.includes('/reports')} />
            )}

            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/inventory" icon="inventory_2" label="Inventory" filled={path.includes('/inventory')} />
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/customers" icon="group" label="Customers" filled={path.includes('/customers')} />

            <div className="my-4 h-px bg-border-light mx-4"></div>

            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/support" icon="contact_support" label="Support Tickets" filled={path.includes('/support')} showDot={hasPendingSupport} />
            <SidebarItem disabled={isAccountLocked} onClick={closeSidebar} to="/settings" icon="settings" label="Settings" filled={path.includes('/settings')} />
            {isOwner && (
              <SidebarItem onClick={closeSidebar} to="/billing" icon="credit_card" label="Subscription & Billing" filled={path.includes('/billing')} />
            )}
          </nav>

          {/* User Profile / Bottom Actions */}
          <div className="mt-auto border-t border-border-light pt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl bg-white border border-border-light shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="bg-primary/10 text-primary rounded-full size-10 border border-primary/10 flex items-center justify-center flex-shrink-0 font-black text-[13px] tracking-tighter"
                >
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'JO'}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-text-main text-sm font-black truncate leading-none mb-1">{user?.name || 'John Owner'}</p>
                  <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider">{user?.role || 'Owner'}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleTheme}
                  className="size-8 flex items-center justify-center text-text-muted hover:text-primary hover:bg-background-light rounded-lg transition-all"
                  title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                >
                  <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button
                  onClick={logout}
                  className="size-8 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-background-light relative w-full transition-colors duration-200">

        {/* Trial Ribbon */}
        {trialDaysLeft !== null && trialDaysLeft > 0 && isOwner && (
          <div className="h-10 bg-primary text-white flex items-center justify-center px-4 shrink-0 shadow-md relative z-40">
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">timer</span>
                FREE TRIAL: {trialDaysLeft} {trialDaysLeft === 1 ? 'DAY' : 'DAYS'} REMAINING
              </span>
              <button
                onClick={() => navigate('/billing')}
                className="bg-white text-primary px-3 py-1 rounded-full text-[10px] hover:bg-slate-100 transition-colors"
              >
                {adminConfig.showPricingInConsole ? 'Choose Plan' : 'Manage Plan'}
              </button>
            </div>
          </div>
        )}

        {/* Subscription Cycle Alert Ribbon */}
        {billingAlert && !billingAlert.isLocked && isOwner && (
          <div className={`h-10 text-white flex items-center justify-center px-4 shrink-0 shadow-md relative z-40 ${billingAlert.type === 'warning' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
            <div className="flex items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">{billingAlert.type === 'warning' ? 'warning' : 'info'}</span>
                {billingAlert.message}
              </span>
              <button
                onClick={() => navigate('/billing')}
                className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] hover:bg-slate-100 transition-colors"
              >
                {billingAlert.status === 'Grace Period' ? 'Pay Now' : 'Details'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navbar Header */}
        <div className="lg:hidden px-4 h-16 bg-surface-card border-b border-border-light flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-text-main hover:bg-background-light active:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-[15px] font-black text-text-main truncate leading-tight">{name}</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-wider">Workshop Console</p>
            </div>
          </div>

          {/* Notification Bell on Mobile */}
          <button className="p-2 rounded-xl text-text-muted hover:bg-background-light active:bg-slate-100 transition-colors relative">
            <span className="material-symbols-outlined text-[26px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-surface-card"></span>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
