
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface SolutionTier {
  icon: string;
  title: string;
  desc: string;
  list: string[];
  isPopular?: boolean;
}

interface LandingConfig {
  logo?: string;
  brandColor?: string;
  heroTitle: string;
  heroSubTitle: string;
  heroCTA: string;
  heroImage: string;
  expertsCount: string;
  efficiencyPercentage: string;

  // Features Section
  featuresTitle: string;
  featuresSubTitle: string;
  features: FeatureCard[];

  // Solutions Section
  solutionsTitle: string;
  solutionsSubTitle: string;
  solutions: SolutionTier[];

  // Contact Section
  contactTitle: string;
  contactSubTitle: string;
  contactEmail: string;
  contactPhone: string;

  // Footer
  footerMessage: string;
}

export const AdminLandingPageEditor: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [config, setConfig] = useState<LandingConfig>({
    heroTitle: "Optimize your workshop DNA.",
    heroSubTitle: "The precision operating system for automotive repair shops. Digitized job cards, inventory intelligence, and rapid invoicing in one unified ecosystem.",
    heroCTA: "Get Started Free",
    heroImage: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=90&w=2000",
    expertsCount: "5,000+ automotive experts",
    efficiencyPercentage: "+40%",
    brandColor: "#0d51b0",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo",
    
    featuresTitle: "Built for Precision.",
    featuresSubTitle: "Standardize your workshop workflow and eliminate the friction of manual administration.",
    features: [
      { icon: 'assignment_add', title: 'Digital Job Cards', color: 'bg-blue-50 text-blue-600', desc: 'Real-time repair tracking. Log technician hours, parts used, and attach before/after photos directly from the bay.' },
      { icon: 'description', title: 'Smart Quotations', color: 'bg-emerald-50 text-emerald-600', desc: 'Professional, branded estimates generated in seconds. One-tap conversion into active job cards or invoices.' },
      { icon: 'inventory_2', title: 'Inventory Intelligence', color: 'bg-amber-50 text-amber-600', desc: 'Auto-tracking of stock levels with multi-supplier management. Never miss a billing for a single litre of oil.' },
      { icon: 'receipt_long', title: 'Automated Invoicing', color: 'bg-purple-50 text-purple-600', desc: 'VAT-compliant invoicing with automated payment tracking. View your aging debtors and collection rates in real-time.' },
      { icon: 'groups', title: 'Customer Portals', color: 'bg-rose-50 text-rose-600', desc: 'Complete vehicle history records for every client. Automated service reminders to keep your bays full.' },
      { icon: 'monitoring', title: 'Workshop Analytics', color: 'bg-indigo-50 text-indigo-600', desc: 'Deep insights into your profit margins, technician efficiency, and bay turnover rates for data-driven decisions.' }
    ],

    solutionsTitle: "Scale Without Friction.",
    solutionsSubTitle: "From solo specialist shops to national franchise networks.",
    solutions: [
      { 
        icon: 'storefront', 
        title: 'Small Workshops', 
        desc: 'Modernize your local garage. Look professional with digital invoices and stop losing track of job history in paper logbooks.',
        list: ['Professional PDF Estimates', 'Basic CRM Vehicle History', 'Mobile Entry from the Bay']
      },
      { 
        icon: 'factory', 
        title: 'Medium Centers', 
        isPopular: true,
        desc: 'For operations with 3-10 bays. Track technician efficiency, manage high-volume parts, and gain 360 financial visibility.',
        list: ['Tech Performance Metrics', 'Multi-Supplier Stock Hub', 'Full Financial Auditing']
      },
      { 
        icon: 'corporate_fare', 
        title: 'Enterprises', 
        desc: 'Centralized control for multi-branch networks and huge fleets. Uniform group-wide standards with granular branch-level control.',
        list: ['Multi-Branch Syncing', 'Advanced Security Protocols', 'API & Custom ERP Bridges']
      }
    ],

    contactTitle: "Let's talk about your bays.",
    contactSubTitle: "Our implementation specialists will help you migrate your data and onboard your technicians in 48 hours or less.",
    contactEmail: "hello@autofix.pro",
    contactPhone: "+27 (021) 555-0900",

    footerMessage: "The high-performance management ecosystem built specifically for elite automotive workshop experts."
  });

  useEffect(() => {
    const saved = localStorage.getItem('autodoc_landing_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse landing config", e);
      }
    }
  }, []);

  const handleUpdate = (field: keyof LandingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'heroImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFeature = (index: number, field: keyof FeatureCard, value: string) => {
    const newFeatures = [...config.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    handleUpdate('features', newFeatures);
  };

  const updateSolution = (index: number, field: keyof SolutionTier, value: any) => {
    const newSolutions = [...config.solutions];
    newSolutions[index] = { ...newSolutions[index], [field]: value };
    handleUpdate('solutions', newSolutions);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('autodoc_landing_config', JSON.stringify(config));
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
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
          <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">credit_card</span>
            <span className="text-sm font-medium">Billing Settings</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group w-full text-left">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">support_agent</span>
            <span className="text-sm font-medium">Support Tickets</span>
          </button>
          <button onClick={() => navigate('/admin/landing-page')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full text-left">
            <span className="material-symbols-outlined icon-fill">auto_fix_high</span>
            <span className="text-sm font-bold">Landing Page Editor</span>
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

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-card-dark border-b border-[#e0dbe6] dark:border-gray-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Landing Page Editor</h2>
          </div>
          <div className="flex items-center gap-3">
             {saveSuccess && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 animate-bounce">
                Saved Successfully!
                </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">publish</span>
              )}
              {isSaving ? 'Saving...' : 'Publish Changes'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1000px] mx-auto p-6 md:p-10 flex flex-col gap-10">
            
            {/* Branding & Color */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">brand_awareness</span>
                    </div>
                    <h3 className="text-lg font-bold">Global Branding</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-32 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                                <img src={config.logo} alt="Logo Preview" className="h-full w-full object-contain" />
                            </div>
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                            >Change Logo</button>
                            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Landing Brand Color</label>
                        <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              value={config.brandColor} 
                              onChange={(e) => handleUpdate('brandColor', e.target.value)}
                              className="size-12 rounded-lg border-none cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold font-mono">{config.brandColor}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Applied to primary buttons and accents</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                        <span className="material-symbols-outlined">stars</span>
                    </div>
                    <h3 className="text-lg font-bold">Hero Section</h3>
                </div>
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Headline</label>
                        <textarea 
                          value={config.heroTitle}
                          onChange={(e) => handleUpdate('heroTitle', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-2xl font-black p-4 leading-tight resize-none"
                          rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Sub-headline</label>
                        <textarea 
                          value={config.heroSubTitle}
                          onChange={(e) => handleUpdate('heroSubTitle', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm font-medium p-4 leading-relaxed text-slate-600"
                          rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CTA Button Text</label>
                            <input 
                              type="text"
                              value={config.heroCTA}
                              onChange={(e) => handleUpdate('heroCTA', e.target.value)}
                              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-bold px-4 h-12"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Image</label>
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-lg bg-slate-100 overflow-hidden">
                                    <img src={config.heroImage} alt="Hero" className="w-full h-full object-cover" />
                                </div>
                                <button 
                                  onClick={() => heroInputRef.current?.click()}
                                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                                >Change Image</button>
                                <input ref={heroInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'heroImage')} accept="image/*" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <span className="material-symbols-outlined">auto_fix_normal</span>
                    </div>
                    <h3 className="text-lg font-bold">Platform Design (Features)</h3>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Features Title</label>
                            <input 
                              type="text"
                              value={config.featuresTitle}
                              onChange={(e) => handleUpdate('featuresTitle', e.target.value)}
                              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-bold px-4 h-12"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Features Subtitle</label>
                            <input 
                              type="text"
                              value={config.featuresSubTitle}
                              onChange={(e) => handleUpdate('featuresSubTitle', e.target.value)}
                              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary px-4 h-12"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Edit Feature Cards</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.features.map((f, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-white/5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input 
                                          type="text" 
                                          value={f.icon} 
                                          onChange={(e) => updateFeature(i, 'icon', e.target.value)}
                                          className="w-20 bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs font-mono"
                                          placeholder="Icon Name"
                                        />
                                        <input 
                                          type="text" 
                                          value={f.title} 
                                          onChange={(e) => updateFeature(i, 'title', e.target.value)}
                                          className="flex-1 bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs font-bold"
                                          placeholder="Title"
                                        />
                                    </div>
                                    <textarea 
                                      value={f.desc} 
                                      onChange={(e) => updateFeature(i, 'desc', e.target.value)}
                                      className="w-full bg-white dark:bg-card-dark border-slate-200 rounded-lg text-[11px] h-16 resize-none"
                                      placeholder="Description"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Industry Solutions Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <span className="material-symbols-outlined">business_center</span>
                    </div>
                    <h3 className="text-lg font-bold">Industry Solutions</h3>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Solutions Title</label>
                            <input 
                              type="text"
                              value={config.solutionsTitle}
                              onChange={(e) => handleUpdate('solutionsTitle', e.target.value)}
                              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-bold px-4 h-12"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Solutions Subtitle</label>
                            <input 
                              type="text"
                              value={config.solutionsSubTitle}
                              onChange={(e) => handleUpdate('solutionsSubTitle', e.target.value)}
                              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary px-4 h-12"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {config.solutions.map((s, i) => (
                            <div key={i} className={`p-5 rounded-2xl border-2 ${s.isPopular ? 'border-primary/30 bg-primary/5' : 'border-slate-100 bg-slate-50 dark:bg-white/5'} space-y-4`}>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black uppercase text-xs tracking-widest text-primary">Solution Tier {i + 1}</h4>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={!!s.isPopular} 
                                          onChange={(e) => updateSolution(i, 'isPopular', e.target.checked)}
                                          className="rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-[10px] font-bold uppercase">Popular Tag</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1 space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Tier Title & Icon</label>
                                        <div className="flex gap-2">
                                            <input 
                                              type="text" 
                                              value={s.icon} 
                                              onChange={(e) => updateSolution(i, 'icon', e.target.value)}
                                              className="w-16 bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs"
                                            />
                                            <input 
                                              type="text" 
                                              value={s.title} 
                                              onChange={(e) => updateSolution(i, 'title', e.target.value)}
                                              className="flex-1 bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Tagline / Brief</label>
                                        <input 
                                          type="text" 
                                          value={s.desc} 
                                          onChange={(e) => updateSolution(i, 'desc', e.target.value)}
                                          className="w-full bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Features List (Comma Separated)</label>
                                    <input 
                                      type="text" 
                                      value={s.list.join(', ')} 
                                      onChange={(e) => updateSolution(i, 'list', e.target.value.split(',').map(item => item.trim()))}
                                      className="w-full bg-white dark:bg-card-dark border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                        <span className="material-symbols-outlined">contact_support</span>
                    </div>
                    <h3 className="text-lg font-bold">Contact Us Section</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Title</label>
                        <input 
                          type="text"
                          value={config.contactTitle}
                          onChange={(e) => handleUpdate('contactTitle', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-bold px-4 h-12"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Subtitle</label>
                        <textarea 
                          value={config.contactSubTitle}
                          onChange={(e) => handleUpdate('contactSubTitle', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm px-4 py-3 h-24 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Business Email</label>
                        <input 
                          type="email"
                          value={config.contactEmail}
                          onChange={(e) => handleUpdate('contactEmail', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary px-4 h-12"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Support Phone</label>
                        <input 
                          type="text"
                          value={config.contactPhone}
                          onChange={(e) => handleUpdate('contactPhone', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary px-4 h-12"
                        />
                    </div>
                </div>
            </div>

            {/* Stats & Footer Message Section */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-[#e0dbe6] dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <h3 className="text-lg font-bold">Social Proof & Footer</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Efficiency Percentage</label>
                        <input 
                          type="text"
                          value={config.efficiencyPercentage}
                          onChange={(e) => handleUpdate('efficiencyPercentage', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-black text-2xl px-4 h-14"
                          placeholder="+40%"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Experts Count Subtext</label>
                        <input 
                          type="text"
                          value={config.expertsCount}
                          onChange={(e) => handleUpdate('expertsCount', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary font-bold px-4 h-14"
                          placeholder="5,000+ automotive experts"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Footer Branding Message</label>
                        <textarea 
                          value={config.footerMessage}
                          onChange={(e) => handleUpdate('footerMessage', e.target.value)}
                          className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm px-4 py-3 h-24 resize-none"
                        />
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 font-medium pb-10">
                Note: These changes only affect the public landing page visible to new visitors.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
