
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const SLIDES = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo",
    title: "Professional Workshop Management",
    text: "Streamline your entire operation with intelligent job cards, automated quoting, and real-time inventory tracking."
  },
  {
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop",
    title: "Effortless Invoicing & CRM",
    text: "Convert quotes to invoices in seconds and keep your customer database organized with vehicle history at your fingertips."
  },
  {
    image: "https://images.unsplash.com/photo-1632823471565-1ec29926594c?q=80&w=2070&auto=format&fit=crop",
    title: "Track Performance & Stock",
    text: "Monitor technician efficiency and never run out of critical parts with low-stock alerts and bin location tracking."
  }
];

const DEMO_USERS = [
  {
    name: 'John Owner',
    email: 'owner@demo.com',
    role: 'Owner',
    workshop: 'Supreme Auto Works',
    color: 'bg-blue-100 text-blue-700',
    icon: 'manage_accounts'
  },
  {
    name: 'Sarah Advisor',
    email: 'sarah@autocare.com',
    role: 'Service Advisor',
    workshop: 'City Center Motors',
    color: 'bg-purple-100 text-purple-700',
    icon: 'support_agent'
  },
  {
    name: 'System Administrator',
    email: 'admin@autodoc.co.za',
    role: 'Site Admin',
    workshop: 'AutoDoc Platform',
    color: 'bg-[#510daf]/10 text-[#510daf]',
    icon: 'shield_person',
    isAdmin: true
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const { availablePlans } = useData();

  const queryParams = new URLSearchParams(location.search);
  const initialIsLogin = queryParams.get('mode') !== 'signup';
  const initialPlan = queryParams.get('plan') || '';

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan || (availablePlans[0]?.id || ''));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedPlanId && availablePlans.length > 0) {
      setSelectedPlanId(availablePlans[0].id);
    }
  }, [availablePlans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials.');
        setIsLoading(false);
      }
    } else {
      // Signup
      if (!fullName || !workshopName || !selectedPlanId) {
        setError('Please fill in all fields.');
        setIsLoading(false);
        return;
      }
      const success = await signup(fullName, email, password, workshopName, selectedPlanId);
      if (!success) {
        setError('Account already exists with this email.');
        setIsLoading(false);
      }
    }
  };

  const handleDemoLogin = async (userProfile: any) => {
    if (userProfile.isAdmin) {
      navigate('/admin');
      return;
    }

    setIsLoading(true);
    // Use 'demo' as the password which is the universal default for seeded demo accounts
    const demoPass = 'demo';

    // Check if user already exists in DB
    const usersStr = localStorage.getItem('autofix_users_db');
    const users = usersStr ? JSON.parse(usersStr) : [];
    const exists = users.find((u: any) => u.email.toLowerCase() === userProfile.email.toLowerCase());

    if (!exists) {
      // Only attempt signup if they don't exist to avoid conflict
      await signup(userProfile.name, userProfile.email, demoPass, userProfile.workshop, 'plan-monthly');
    }

    const result = await login(userProfile.email, demoPass);
    if (!result.success) {
      setError(result.error || 'Demo login failed.');
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-row overflow-hidden font-display bg-surface-card transition-colors duration-200">
      {/* Left Section - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:flex-none lg:px-16 xl:w-[45%] h-full min-h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-[460px] py-10 relative">

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="group mb-8 flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Website
          </button>

          <div className="mb-8 flex flex-col gap-4 items-start">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[24px]">garage_home</span>
              </div>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-text-main">AutoFix Pro</h2>
            </div>
          </div>

          {!isLogin && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-sm font-black">celebration</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-black text-primary uppercase tracking-widest">Free Trial Activated</p>
                <p className="text-xs text-blue-600 font-medium leading-relaxed">Register now to start your <span className="font-bold">7-day free trial</span>. No credit card required. Full access to all features immediately.</p>
              </div>
            </div>
          )}

          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-[28px] md:text-[32px] font-bold leading-tight tracking-tight text-text-main">
              {isLogin ? 'Welcome Back' : 'Workshop Registration'}
            </h1>
            <p className="text-sm font-normal leading-normal text-text-muted">
              {isLogin ? 'Enter your credentials to access your workshop.' : 'Setup your professional workshop ecosystem in seconds.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Full Name</span>
                    <input
                      className="h-12 w-full rounded-xl border border-border-light bg-background-light px-4 text-sm font-medium leading-normal text-text-main placeholder:text-text-muted focus:border-primary focus:outline-0 focus:ring-1 focus:ring-primary transition-all"
                      placeholder="John Doe"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Workshop Name</span>
                    <input
                      className="h-12 w-full rounded-xl border border-border-light bg-background-light px-4 text-sm font-medium leading-normal text-text-main placeholder:text-text-muted focus:border-primary focus:outline-0 focus:ring-1 focus:ring-primary transition-all"
                      placeholder="John's Auto"
                      type="text"
                      autoComplete="organization"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Choose Subscription Cycle</span>
                  <div className="grid grid-cols-3 gap-3">
                    {availablePlans.map(plan => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex flex-col p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden ${selectedPlanId === plan.id ? 'border-primary bg-primary/5' : 'border-border-light bg-surface-card hover:border-primary/20'}`}
                      >
                        {selectedPlanId === plan.id && <span className="absolute top-0 right-0 p-1 bg-primary text-white"><span className="material-symbols-outlined text-xs block">check</span></span>}
                        <span className="text-[10px] font-black uppercase text-text-muted truncate">{plan.duration}</span>
                        <span className="text-sm font-black text-text-main">R{plan.price}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-text-muted font-bold italic">Your 7-day trial starts immediately on registration.</p>
                </div>
              </>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Email Address</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-xl border border-border-light bg-background-light px-4 text-sm font-medium leading-normal text-text-main placeholder:text-text-muted focus:border-primary focus:outline-0 focus:ring-1 focus:ring-primary transition-all"
                  placeholder="mechanic@workshop.co.za"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">mail</span>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em] ml-1">Secure Password</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-xl border border-border-light bg-background-light px-4 text-sm font-medium leading-normal text-text-main placeholder:text-text-muted focus:border-primary focus:outline-0 focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </label>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input className="h-4 w-4 rounded border-border-light text-primary focus:ring-0 focus:ring-offset-0 bg-background-light" type="checkbox" />
                  <span className="text-sm font-normal text-text-main">Remember me</span>
                </label>
                <a className="text-sm font-bold text-primary hover:underline" href="#">Forgot Password?</a>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                disabled={isLoading}
                className="flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-primary px-4 text-sm font-black uppercase tracking-[0.1em] text-white transition-all hover:bg-primary-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                type="submit"
              >
                {isLoading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="truncate">{isLogin ? 'Log In to Dashboard' : 'Start My 7-Day Free Trial'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Access Section */}
          {isLogin && (
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-border-light flex-1"></div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Quick Demo Access</span>
                <div className="h-px bg-border-light flex-1"></div>
              </div>
              <div className="flex flex-col gap-3">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => handleDemoLogin(user)}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border-light bg-background-light hover:bg-surface-card hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center ${user.color}`}>
                      <span className="material-symbols-outlined">{user.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-main truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.role} • {user.workshop}</p>
                    </div>
                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">arrow_forward</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="font-bold text-primary hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          <div className="mt-auto pt-8 text-center lg:text-left">
            <p className="text-xs text-text-muted">© 2024 AutoFix Pro. Engineered for Workshop Precision.</p>
          </div>
        </div>
      </div>

      {/* Right Section - Image Slider */}
      <div className="hidden lg:relative lg:flex lg:flex-1 lg:flex-col overflow-hidden bg-slate-900">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10"></div>

        {/* Text Content */}
        <div className="relative flex h-full flex-col justify-end px-12 pb-16 text-white max-w-3xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/10 shadow-lg">
            <span className="material-symbols-outlined text-white">verified_user</span>
          </div>

          <div className="relative h-32">
            {SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute bottom-0 left-0 w-full transition-all duration-700 ease-in-out transform ${index === currentSlide
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
              >
                <h3 className="mb-3 text-3xl font-bold leading-tight">{slide.title}</h3>
                <p className="text-lg text-gray-200 font-light leading-relaxed max-w-xl">{slide.text}</p>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="mt-8 flex gap-3">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
