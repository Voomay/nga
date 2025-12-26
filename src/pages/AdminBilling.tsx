
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, SubscriptionPlan } from '../context/DataContext';

export const AdminBilling: React.FC = () => {
  const navigate = useNavigate();
  const { systemBankDetails, updateSystemBankDetails, availablePlans, updateAvailablePlans, adminConfig, updateAdminConfig } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Local state for plans (copied from context)
  const [localPlans, setLocalPlans] = useState<SubscriptionPlan[]>([...availablePlans]);

  const handleUpdatePlan = (id: string, field: keyof SubscriptionPlan, value: any) => {
    setLocalPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      updateAvailablePlans(localPlans);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const addNewPlan = () => {
    const newId = `plan-${Date.now()}`;
    const newPlan: SubscriptionPlan = {
      id: newId,
      name: 'Custom Duration',
      price: '0',
      duration: 'Monthly',
      description: 'Describe the value proposition for this billing cycle.',
      features: ['Full Access Included'],
      popular: false,
      status: 'Active'
    };
    setLocalPlans([...localPlans, newPlan]);
  };

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
          <button onClick={() => navigate('/admin')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button onClick={() => navigate('/admin/member-subscriptions')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">payments</span>
            <span className="text-sm font-medium">Member Subscriptions</span>
          </button>
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">credit_card</span>
            <span className="text-sm font-bold">Billing Settings</span>
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
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" style={{backgroundImage: "url('https://ui-avatars.com/api/?name=Admin&background=0d51b0&color=fff')"}}></div>
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
            <h2 className="text-lg font-bold text-text-main dark:text-white">Subscription Infrastructure</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Billing Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manage pricing, duration tiers, and system banking details.</p>
              </div>
              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 animate-bounce">
                    Infrastructure Updated!
                  </span>
                )}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                  )}
                  {isSaving ? 'Updating...' : 'Publish Settings'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Display Preferences */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-[#e0dbe6] dark:border-gray-800 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-[#e0dbe6] dark:border-gray-800 bg-indigo-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                <span className="material-symbols-outlined">visibility</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Platform Display Preferences</h3>
                                <p className="text-sm text-slate-500">Toggle visibility of specific pricing components.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Show Pricing on Landing Page</span>
                                <span className="text-xs text-slate-500">Controls the visibility of tiered plans for new visitors.</span>
                            </div>
                            <button 
                                onClick={() => updateAdminConfig({ showPricingOnLanding: !adminConfig.showPricingOnLanding })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${adminConfig.showPricingOnLanding ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform ${adminConfig.showPricingOnLanding ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-gray-800 pt-6">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Show Pricing in Workshop Console</span>
                                <span className="text-xs text-slate-500">Hides plan pricing and choice grid from active workshop owners.</span>
                            </div>
                            <button 
                                onClick={() => updateAdminConfig({ showPricingInConsole: !adminConfig.showPricingInConsole })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${adminConfig.showPricingInConsole ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform ${adminConfig.showPricingInConsole ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Collection Details */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-[#e0dbe6] dark:border-gray-800 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-[#e0dbe6] dark:border-gray-800 bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Collection Details (EFT)</h3>
                                <p className="text-sm text-slate-500">Recipient account for manual verification flow.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Bank Name</label>
                            <input 
                            className="w-full text-sm rounded-lg border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-11"
                            type="text" 
                            value={systemBankDetails.bankName}
                            onChange={(e) => updateSystemBankDetails({...systemBankDetails, bankName: e.target.value})}
                            placeholder="e.g. FNB Business"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Holder</label>
                            <input 
                            className="w-full text-sm rounded-lg border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-11"
                            type="text" 
                            value={systemBankDetails.accountName}
                            onChange={(e) => updateSystemBankDetails({...systemBankDetails, accountName: e.target.value})}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Number</label>
                            <input 
                            className="w-full text-sm rounded-lg border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-11 font-mono"
                            type="text" 
                            value={systemBankDetails.accountNumber}
                            onChange={(e) => updateSystemBankDetails({...systemBankDetails, accountNumber: e.target.value})}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Branch Code</label>
                            <input 
                            className="w-full text-sm rounded-lg border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-11 font-mono"
                            type="text" 
                            value={systemBankDetails.branchCode}
                            onChange={(e) => updateSystemBankDetails({...systemBankDetails, branchCode: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Plans Management */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                        <span className="material-symbols-outlined">subscriptions</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Subscription Tiers</h3>
                </div>
                <button 
                  onClick={addNewPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Plan
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {localPlans.map((plan) => (
                  <div key={plan.id} className={`bg-white dark:bg-card-dark rounded-2xl border ${plan.popular ? 'border-2 border-primary shadow-lg' : 'border-[#e0dbe6] dark:border-gray-800'} overflow-hidden flex flex-col group`}>
                    <div className="p-6 border-b border-slate-100 dark:border-gray-800 relative">
                        {plan.popular && <span className="absolute top-4 right-4 bg-primary text-white text-[9px] font-black uppercase px-2 py-1 rounded">POPULAR</span>}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Internal Name</label>
                                <input 
                                    className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 dark:text-white focus:ring-0" 
                                    type="text"
                                    value={plan.name}
                                    onChange={(e) => handleUpdatePlan(plan.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-bold text-slate-400 mb-1">R</span>
                                <input 
                                    className="w-24 bg-transparent border-none p-0 text-2xl font-black text-slate-900 dark:text-white focus:ring-0" 
                                    type="text"
                                    value={plan.price}
                                    onChange={(e) => handleUpdatePlan(plan.id, 'price', e.target.value)}
                                />
                                <div className="ml-2 flex-1">
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold py-1 px-2 focus:ring-1 focus:ring-primary"
                                        value={plan.duration}
                                        onChange={(e) => handleUpdatePlan(plan.id, 'duration', e.target.value)}
                                    >
                                        <option value="Monthly">Monthly Cycle</option>
                                        <option value="Yearly">Yearly Cycle</option>
                                        <option value="3-Year">3-Year Cycle</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tagline</label>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-medium py-2 px-3 focus:ring-1 focus:ring-primary text-slate-600 dark:text-slate-300"
                                type="text"
                                value={plan.description}
                                onChange={(e) => handleUpdatePlan(plan.id, 'description', e.target.value)}
                                placeholder="Short value statement..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Features (Comma Separated)</label>
                            <textarea 
                                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-medium py-3 px-3 focus:ring-1 focus:ring-primary text-slate-600 dark:text-slate-300 resize-none"
                                value={plan.features.join(', ')}
                                onChange={(e) => handleUpdatePlan(plan.id, 'features', e.target.value.split(',').map(f => f.trim()))}
                                placeholder="Full Access, Priority Support, etc..."
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between border-t border-slate-100 dark:border-gray-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={plan.popular}
                                onChange={(e) => handleUpdatePlan(plan.id, 'popular', e.target.checked)}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-xs font-bold text-slate-500">Recommend</span>
                        </label>
                        <button 
                            onClick={() => {
                                if (confirm('Delete this plan tier?')) {
                                    setLocalPlans(localPlans.filter(p => p.id !== plan.id));
                                }
                            }}
                            className="text-xs font-bold text-red-500 hover:underline"
                        >Remove Plan</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-primary">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Feature Access Policy</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400/80 mt-1 leading-relaxed">
                        The platform enforces a "Full Access" policy. Choosing different durations only affects billing frequency and discount rates. 
                        No feature gating should be implemented based on the plan ID.
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
