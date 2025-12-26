
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface FadeInDirectionProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

const FadeInDirection: React.FC<FadeInDirectionProps> = ({ children, direction = 'up', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      default: return 'translateY(30px)';
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
      }}
    >
      {children}
    </div>
  );
};

// Helper to convert hex to RGB triplet for Tailwind CSS variables
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '13 81 176';
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { availablePlans, adminConfig } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Landing Config with Defaults
  const [config, setConfig] = useState({
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Load Landing Config
    const savedLanding = localStorage.getItem('autodoc_landing_config');
    if (savedLanding) {
        try {
            const parsed = JSON.parse(savedLanding);
            setConfig(prev => ({ ...prev, ...parsed }));
            if (parsed.brandColor) {
                document.documentElement.style.setProperty('--color-primary', hexToRgb(parsed.brandColor));
            }
        } catch (e) { console.error(e); }
    }

    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.documentElement.style.setProperty('--color-primary', '13 81 176');
    };
  }, []);

  const handleCTA = (planId?: string) => {
    if (isAuthenticated) {
        navigate('/dashboard');
    } else {
        const planParam = planId ? `&plan=${planId}` : '';
        navigate(`/login?mode=signup${planParam}`);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setContactForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 70; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white text-slate-900 font-display selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-slate-100' : 'bg-transparent py-5 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="size-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                {config.logo ? <img src={config.logo} className="h-6 w-auto" alt="Logo" /> : <span className="material-symbols-outlined text-[22px]">garage_home</span>}
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900">AutoFix Pro</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-bold text-slate-500">
            <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-primary transition-colors">Solutions</button>
            {adminConfig.showPricingOnLanding && <button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors">Pricing</button>}
            <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-[13px] font-bold text-slate-900 hover:text-primary transition-colors px-3 py-2">
              Sign In
            </button>
            <button onClick={() => handleCTA()} className="bg-primary text-white px-5 md:px-6 py-2.5 rounded-full text-[13px] font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10 opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <FadeInDirection direction="right">
              <div className="flex flex-col gap-6 md:gap-8 max-w-xl text-center lg:text-left items-center lg:items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[11px] font-black uppercase tracking-widest w-fit border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Trusted by 2,500+ Workshops
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  {config.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                  {config.heroSubTitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button onClick={() => handleCTA()} className="h-14 md:h-16 px-10 md:px-12 bg-primary text-white rounded-full font-black text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group">
                    {config.heroCTA}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
                <div className="flex items-center gap-4 pt-2">
                   <div className="flex -space-x-2">
                      {[11,12,13,14].map(i => (
                        <div key={i} className="size-9 rounded-full border-[3px] border-white bg-slate-200 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?u=auto${i}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-tight text-left">
                      Join <span className="text-slate-900">{config.expertsCount}</span><br/>running successful workshops.
                    </p>
                </div>
              </div>
            </FadeInDirection>

            <FadeInDirection direction="left" delay={0.2}>
              <div className="relative mt-8 md:mt-0">
                 <div className="absolute -top-10 -right-10 size-64 bg-primary/10 blur-[100px] rounded-full"></div>
                 <div className="relative z-10 rounded-[2.5rem] md:rounded-[4rem] p-3 md:p-5 bg-white/40 backdrop-blur-xl border border-white shadow-[0_32px_64px_-16px_rgba(var(--color-primary),0.15)] overflow-visible">
                    <div className="rounded-[2rem] md:rounded-[3.5rem] overflow-hidden aspect-[4/3] w-full bg-slate-200">
                        <img 
                          src={config.heroImage} 
                          alt="Workshop Environment" 
                          className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <div className="absolute -bottom-6 -right-2 md:-bottom-10 md:-right-6 z-20 bg-white p-5 md:p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-0.5 min-w-[200px] md:min-w-[240px]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="size-2 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Efficiency Boost</p>
                        </div>
                        <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{config.efficiencyPercentage}</p>
                        <p className="text-[11px] md:text-xs text-slate-400 font-bold italic leading-tight">Average time saved per job</p>
                    </div>
                 </div>
              </div>
            </FadeInDirection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <FadeInDirection>
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
              <h2 className="text-primary text-[11px] font-black uppercase tracking-[0.3em]">Platform DNA</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">{config.featuresTitle}</h3>
              <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">{config.featuresSubTitle}</p>
            </div>
          </FadeInDirection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {config.features.map((feature, idx) => (
              <FadeInDirection key={idx} delay={idx * 0.1}>
                <div className="bg-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300 group h-full">
                  <div className={`size-14 md:size-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <span className="material-symbols-outlined text-[32px] md:text-[36px]">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </FadeInDirection>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[200px] rounded-full pointer-events-none opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <FadeInDirection>
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
              <h2 className="text-primary text-[11px] font-black uppercase tracking-[0.3em]">Industry Solutions</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">{config.solutionsTitle}</h3>
              <p className="text-slate-400 text-base md:text-lg font-medium">{config.solutionsSubTitle}</p>
            </div>
          </FadeInDirection>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
            {config.solutions.map((sol, idx) => (
              <FadeInDirection key={idx} delay={idx * 0.1}>
                <div className={`p-10 md:p-12 rounded-[3rem] transition-all flex flex-col h-full group ${sol.isPopular ? 'bg-primary text-white border border-primary hover:shadow-2xl transform lg:-translate-y-8' : 'bg-white/5 border border-white/10 hover:border-primary/50'}`}>
                  {sol.isPopular && (
                    <div className="absolute top-8 right-8">
                        <span className="bg-white/20 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em]">Leading Choice</span>
                    </div>
                  )}
                  <div className={`size-16 rounded-2xl flex items-center justify-center mb-8 ${sol.isPopular ? 'bg-white/10' : 'bg-white/10 group-hover:bg-primary/20 transition-colors'}`}>
                      <span className={`material-symbols-outlined text-4xl ${sol.isPopular ? 'text-white' : 'text-primary'}`}>{sol.icon}</span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">{sol.title}</h4>
                  <p className={`mb-10 text-sm md:text-base leading-relaxed font-medium ${sol.isPopular ? 'text-blue-50' : 'text-slate-400'}`}>{sol.desc}</p>
                  <ul className={`space-y-4 mt-auto border-t pt-10 ${sol.isPopular ? 'border-white/20' : 'border-white/5'}`}>
                      {sol.list.map((item, lIdx) => (
                        <li key={lIdx} className={`flex items-center gap-4 text-[13px] font-bold ${sol.isPopular ? 'text-blue-50' : 'text-slate-300'}`}>
                          <span className={`material-symbols-outlined text-[22px] ${sol.isPopular ? 'text-white' : 'text-primary'}`}>check_circle</span>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </FadeInDirection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - DYNAMIC TOGGLE */}
      {adminConfig.showPricingOnLanding && (
        <section id="pricing" className="py-20 md:py-32 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <FadeInDirection>
              <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
                <h2 className="text-primary text-[11px] font-black uppercase tracking-[0.3em]">Value Engineering</h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">Flexible Cycles.</h3>
                <p className="text-base md:text-lg text-slate-600 font-medium">All plans include full access to every feature. Start a 7-day trial with no commitment.</p>
              </div>
            </FadeInDirection>

            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {availablePlans.map((plan, idx) => (
                <FadeInDirection key={plan.id} delay={idx * 0.1}>
                  <div className={`p-8 md:p-12 rounded-[3.5rem] border flex flex-col gap-10 transition-all h-full ${plan.popular ? 'bg-white border-primary shadow-2xl scale-105 relative z-10' : 'bg-slate-50 border-slate-200 hover:border-primary/30'}`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h4>
                        {plan.popular && <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Most Popular</span>}
                      </div>
                      <p className="text-slate-500 text-[13px] font-bold">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">R{plan.price}</span>
                      <span className="text-slate-400 font-black text-sm uppercase tracking-widest ml-2">/ {plan.duration.toLowerCase()}</span>
                    </div>
                    <hr className="border-slate-200" />
                    <ul className="flex flex-col gap-6 mb-4 flex-1">
                      {plan.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 text-[13px] font-black text-slate-700 leading-snug">
                          <span className="material-symbols-outlined text-primary text-[22px] shrink-0">verified</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-4">
                        <button onClick={() => handleCTA(plan.id)} className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] transition-all ${plan.popular ? 'bg-primary text-white hover:bg-primary-hover shadow-xl' : 'bg-slate-900 text-white hover:bg-black shadow-lg'}`}>
                            Start Free Trial
                        </button>
                        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">7 Days Free • No Credit Card</p>
                    </div>
                  </div>
                </FadeInDirection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <FadeInDirection>
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(13,81,176,0.12)] border border-slate-100 overflow-hidden relative">
              <div className="grid lg:grid-cols-5">
                
                {/* Left side: Information (2/5) */}
                <div className="lg:col-span-2 p-10 md:p-16 lg:p-20 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-50"></div>
                  
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">{config.contactTitle}</h3>
                      <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed">{config.contactSubTitle}</p>
                    </div>

                    <div className="flex flex-col gap-6 mt-4">
                      <div className="flex items-center gap-5 group cursor-pointer">
                        <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                          <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mb-0.5">Deployment</span>
                          <span className="text-base md:text-lg font-bold">{config.contactEmail}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 group cursor-pointer">
                        <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                          <span className="material-symbols-outlined text-primary text-2xl">headset_mic</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mb-0.5">Support Desk</span>
                          <span className="text-base md:text-lg font-bold">{config.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-16 pt-10 border-t border-white/10 flex items-center gap-4">
                     <div className="flex -space-x-3">
                        {[21,22,23].map(i => (
                          <div key={i} className="size-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=tech${i}`} alt="Specialist" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-tight">
                        Specialists standing by<br/><span className="text-white">Response time: ~12 mins</span>
                      </p>
                  </div>
                </div>

                {/* Right side: Modern Form (3/5) */}
                <div className="lg:col-span-3 p-10 md:p-16 lg:p-20 bg-white flex flex-col">
                  {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-6 animate-in fade-in zoom-in duration-700">
                      <div className="size-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-100 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)]">
                        <span className="material-symbols-outlined text-5xl font-bold">done_all</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Engine Started!</h4>
                        <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto">We've received your request. An expert advisor will call you within the hour.</p>
                      </div>
                      <button onClick={() => setSubmitted(false)} className="px-8 py-3 rounded-full bg-slate-900 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all mt-6 shadow-xl active:scale-95">Send New Message</button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-8">
                      <div className="flex flex-col gap-2">
                         <h4 className="text-2xl font-black text-slate-900 tracking-tight">Drop us a line</h4>
                         <p className="text-sm text-slate-500 font-medium">Please fill out the form below and we'll get back to you shortly.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 group">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 group-focus-within:text-primary transition-colors">Your Name</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                            <input 
                              required
                              className="w-full h-14 rounded-2xl bg-white border border-slate-200 focus:border-primary px-12 transition-all text-base font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 outline-none" 
                              type="text" 
                              placeholder="e.g. John Carter"
                              value={contactForm.name}
                              onChange={e => setContactForm({...contactForm, name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 group">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 group-focus-within:text-primary transition-colors">Work Email</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                            <input 
                              required
                              className="w-full h-14 rounded-2xl bg-white border border-slate-200 focus:border-primary px-12 transition-all text-base font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 outline-none" 
                              type="email" 
                              placeholder="name@workshop.co.za"
                              value={contactForm.email}
                              onChange={e => setContactForm({...contactForm, email: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Interest</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 group-focus-within:text-primary transition-colors text-[20px]">settings_accessibility</span>
                           <select 
                             className="w-full h-14 rounded-2xl bg-white border border-slate-200 focus:border-primary px-12 transition-all text-base font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer"
                             value={contactForm.subject}
                             onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                           >
                             <option>General Inquiry</option>
                             <option>Product Demo Request</option>
                             <option>Enterprise Migration</option>
                             <option>Custom Feature Request</option>
                           </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Requirements</label>
                        <div className="relative">
                          <textarea 
                            required
                            className="w-full h-40 rounded-[2rem] bg-white border border-slate-200 focus:border-primary px-6 py-6 transition-all text-base font-bold placeholder:text-slate-300 resize-none focus:ring-4 focus:ring-primary/5 outline-none" 
                            placeholder="Tell us about your workshop volume, team size or specific software needs..."
                            value={contactForm.message}
                            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          ></textarea>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="h-16 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] hover:bg-primary-hover shadow-[0_20px_40px_-10px_rgba(var(--color-primary),0.4)] transition-all mt-4 active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                      >
                        Launch Inquiry
                        <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">send</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </FadeInDirection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-32 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-24">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    {config.logo ? <img src={config.logo} className="h-6 w-auto" alt="Logo" /> : <span className="material-symbols-outlined text-[24px]">garage_home</span>}
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">AutoFix Pro</span>
              </div>
              <p className="text-slate-500 font-bold text-base leading-relaxed">
                {config.footerMessage}
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.4em]">Core Platform</h5>
              <div className="flex flex-col gap-5 text-[13px] text-slate-500 font-black">
                <button onClick={() => scrollToSection('features')} className="text-left hover:text-primary transition-colors uppercase tracking-widest">Key Features</button>
                {adminConfig.showPricingOnLanding && <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-primary transition-colors uppercase tracking-widest">Pricing Plans</button>}
                <button onClick={() => scrollToSection('solutions')} className="text-left hover:text-primary transition-colors uppercase tracking-widest">Our Solutions</button>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.4em]">Expert Resources</h5>
              <div className="flex flex-col gap-5 text-[13px] text-slate-500 font-black">
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Docs & API</a>
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Support Hub</a>
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Changelog</a>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.4em]">Legal Standard</h5>
              <div className="flex flex-col gap-5 text-[13px] text-slate-500 font-black">
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest">Cookie Audit</a>
              </div>
            </div>
          </div>
          
          <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] text-center md:text-left">© 2024 AutoFix Pro. Engineered for Workshop Excellence.</p>
            <div className="flex items-center gap-8 opacity-30 grayscale contrast-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="paypal" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="visa" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="mastercard" className="h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
