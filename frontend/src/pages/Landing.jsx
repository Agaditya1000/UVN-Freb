import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, ShieldCheck, RefreshCw, FileText, ArrowRight,
  Building2, Users, CheckCircle2, TrendingUp, Zap,
  BarChart3, Database, Layers, MoreHorizontal
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import heroImage from '../assets/hero.png';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const features = [
  {
    icon: <Globe className="text-primary w-8 h-8" />,
    title: 'Global Compliance',
    desc: 'Support for GAAP, IFRS, and local tax standards built into the core engine.',
  },
  {
    icon: <ShieldCheck className="text-primary w-8 h-8" />,
    title: 'Enterprise Security',
    desc: 'Granular RBAC and audit logs ensuring your financial data is always protected.',
  },
  {
    icon: <RefreshCw className="text-primary w-8 h-8" />,
    title: 'Real-time Ledger',
    desc: 'Instant synchronization across multi-tenant workspaces with zero latency.',
  },
  {
    icon: <FileText className="text-primary w-8 h-8" />,
    title: 'Intelligent Reporting',
    desc: 'Automated balance sheets and cash flow statements with one-click export.',
  },
];

const solutions = [
  {
    icon: <Building2 className="w-6 h-6 text-primary" />,
    title: 'Small Businesses',
    desc: 'Simplify your bookkeeping and generate tax-ready reports in minutes.',
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Accountants',
    desc: 'Manage multiple clients with unified ledger access and automated workflows.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-primary" />,
    title: 'Startups',
    desc: 'Scale your financial infrastructure as fast as your growth with agile tools.',
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: 'Enterprises',
    desc: 'Custom workflows and volume-ready transaction engines for scale.',
  },
];

const enterprisePoints = [
  'Role-based access control (RBAC)',
  'Full-scope Audit Logging',
  'Multi-tenant Architecture',
  'Real-time Financial Consolidation'
];

const HERO_IMAGES = [
  heroImage,
  "https://images.unsplash.com/photo-1554224155-8d04182405f2?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1507679799987-c7377f323b5d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1454165833444-18d72855024e?auto=format&fit=crop&q=80&w=1200"
];

const Landing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthModalOpen = location.pathname === '/login' || location.pathname === '/signup';
  const [activeLayer, setActiveLayer] = useState('a');
  const [layerAIdx, setLayerAIdx] = useState(0);
  const [layerBIdx, setLayerBIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentIdx = activeLayer === 'a' ? layerAIdx : layerBIdx;

  const preloadImage = (idx) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = HERO_IMAGES[idx];
    });

  const goToSlide = async (nextIdx) => {
    if (nextIdx === currentIdx) return;
    await preloadImage(nextIdx);

    if (activeLayer === 'a') {
      setLayerBIdx(nextIdx);
      setActiveLayer('b');
    } else {
      setLayerAIdx(nextIdx);
      setActiveLayer('a');
    }
  };

  useEffect(() => {
    // Preload the first couple of slides to avoid showing an empty/gray hero.
    void preloadImage(0);
    void preloadImage(1);

    const timer = setInterval(() => {
      void goToSlide((currentIdx + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIdx, activeLayer]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !isAuthModalOpen) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, isAuthModalOpen, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg text-text font-roboto antialiased flex flex-col relative overflow-x-hidden transition-colors duration-500">

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div
        className={`flex flex-col min-h-screen transition-all duration-700 ${isAuthModalOpen ? 'blur-md scale-[0.99] brightness-75 pointer-events-none select-none' : ''
          }`}
      >
        {/* Navigation */}
        <nav className="flex justify-between items-center px-4 md:px-16 py-6 border-b border-border bg-surface/70 backdrop-blur-xl sticky top-0 z-50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-xl font-bold italic tracking-tighter shadow-lg shadow-primary/30 shrink-0">UV</div>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-lg tracking-tight text-text leading-tight">UV Netware</span>
              <span className="text-primary font-black text-[10px] md:text-xs tracking-[0.2em] uppercase -mt-1">Utilities</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10 mr-auto ml-16">
            <a href="#features" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors tracking-tight">Features</a>
            <a href="#solutions" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors tracking-tight">Solutions</a>
            <a href="#enterprise" className="text-sm font-bold text-text-secondary hover:text-primary transition-colors tracking-tight">Enterprise</a>
          </div>

          <div className="flex gap-2 sm:gap-4 items-center">

            <div className="scale-75 sm:scale-90">
              <ThemeToggle />
            </div>

            <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>

            <Link
              to={user ? '/dashboard' : '/login'}
              className="px-4 md:px-8 py-2 md:py-3 bg-primary text-white text-xs md:text-sm font-bold rounded-xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
            >
              {user ? 'Dashboard' : 'Login'}
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 md:px-5 py-2 text-xs md:text-sm font-bold text-text-secondary hover:text-text transition-all"
              >
                Sign out
              </button>
            )}

            {/* Mobile Menu Trigger (Three Dots) - ONLY MOBILE */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:text-primary transition-all flex items-center justify-center shadow-sm"
                aria-label="Menu"
              >
                <MoreHorizontal size={20} />
              </button>

              {/* Mobile Nav Dropdown */}
              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden z-[60]">
                  <div className="flex flex-col p-2">
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-sm font-bold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all">Features</a>
                    <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-sm font-bold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all">Solutions</a>
                    <a href="#enterprise" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-sm font-bold text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all">Enterprise</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center pt-24 pb-32 px-6 md:px-12 overflow-hidden">
          <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-10 inline-flex items-center gap-3 animate-bounce-subtle">
            <span className="flex w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20"></span>
            <span className="font-bold text-primary tracking-widest uppercase text-[10px]">Built for secure financial operations</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold text-text tracking-tight leading-[1.05] max-w-5xl mb-10">
            Smart accounting for <span className="text-primary italic relative">modern<span className="absolute bottom-1 left-0 w-full h-1 bg-primary/20 -z-10"></span></span> businesses
          </h1>

          <p className="text-lg md:text-2xl text-text-secondary max-w-3xl mb-14 font-medium leading-relaxed opacity-90">
            A complete SaaS platform to manage accounts, record transactions, and generate financial reports with accuracy and compliance.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mb-20 w-full justify-center">
            <Link
              to="/signup"
              className="px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group text-lg"
            >
              Provision Workspace <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <button className="px-10 py-5 border border-border bg-surface text-text font-bold rounded-2xl hover:bg-bg transition-all text-lg shadow-sm">
              Request Demo
            </button>
          </div>

	          <div className="w-full max-w-6xl p-3 bg-surface/40 border border-border/50 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] backdrop-blur-md relative overflow-hidden group">
	            <div className="aspect-[16/9] bg-slate-100/50 rounded-[30px] overflow-hidden relative shadow-inner">
	              <img
	                src={HERO_IMAGES[layerAIdx]}
	                alt=""
	                aria-hidden="true"
	                decoding="async"
	                loading="eager"
	                fetchPriority={activeLayer === 'a' && layerAIdx === 0 ? 'high' : 'auto'}
	                referrerPolicy="no-referrer"
	                onError={(e) => {
	                  if (e.currentTarget.src !== heroImage) e.currentTarget.src = heroImage;
	                }}
	                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out scale-110 group-hover:scale-100 ${activeLayer === 'a' ? 'opacity-100' : 'opacity-0'}`}
	              />
	              <img
	                src={HERO_IMAGES[layerBIdx]}
	                alt=""
	                aria-hidden="true"
	                decoding="async"
	                loading="lazy"
	                fetchPriority="auto"
	                referrerPolicy="no-referrer"
	                onError={(e) => {
	                  if (e.currentTarget.src !== heroImage) e.currentTarget.src = heroImage;
	                }}
	                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out scale-110 group-hover:scale-100 ${activeLayer === 'b' ? 'opacity-100' : 'opacity-0'}`}
	              />
	              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
	              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10 p-2 bg-black/10 backdrop-blur-md rounded-full">
	                {HERO_IMAGES.map((_, idx) => (
	                  <div
	                    key={idx}
	                    className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentIdx ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
	                      }`}
	                    onClick={() => void goToSlide(idx)}
	                  />
	                ))}
	              </div>
	            </div>
	          </div>
        </section>

        {/* Features Slider / Grid */}
        <section id="features" className="py-32 px-8 md:px-20 bg-surface border-y border-border relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 text-center">
              <h2 className="text-xs font-bold text-primary tracking-[0.4em] mb-4 uppercase">Core Infrastructure</h2>
              <p className="text-4xl md:text-5xl font-bold text-text mb-6">Built for scale. Designed for precision.</p>
              <p className="text-text-secondary max-w-2xl mx-auto font-medium text-lg">Everything your finance operation requires to operate at peak performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {features.map((feature, i) => (
                <div key={i} className="group p-10 bg-bg border border-border rounded-[32px] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    {React.cloneElement(feature.icon, { size: 120 })}
                  </div>
                  <div className="mb-8 p-4 bg-primary/10 w-fit rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-4 transition-colors group-hover:text-primary">{feature.title}</h3>
                  <p className="text-text-secondary font-medium leading-relaxed mb-8 opacity-80">{feature.desc}</p>
                  <Link to="/signup" className="mt-auto text-primary font-bold text-sm inline-flex items-center gap-2 group/link">
                    Explore Feature <ArrowRight size={16} className="group-hover/link:translate-x-2 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section id="solutions" className="py-32 px-8 md:px-20 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-xs font-bold text-primary tracking-[0.4em] mb-4 uppercase">Versatile Solutions</h2>
              <p className="text-4xl font-bold text-text mb-4">Tailored for every stage of growth.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {solutions.map((sol, i) => (
                <div key={i} className="p-8 bg-surface border border-border rounded-3xl hover:border-primary transition-all duration-300 group cursor-default shadow-sm hover:shadow-xl">
                  <div className="mb-6 p-4 bg-primary/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{sol.icon}</div>
                  <h4 className="text-xl font-bold text-text mb-3">{sol.title}</h4>
                  <p className="text-text-secondary text-sm font-medium leading-relaxed opacity-80 mb-6">{sol.desc}</p>
                  <div className="text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    View Case Study <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section id="enterprise" className="py-40 px-8 md:px-20 bg-surface border-t border-border overflow-hidden relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="anim-fade-up">
              <h2 className="text-sm font-black text-primary tracking-[0.5em] mb-6 uppercase">Enterprise Ready</h2>
              <h3 className="text-4xl md:text-6xl font-bold text-text mb-10 leading-tight">Built for enterprise-grade financial operations.</h3>
              <p className="text-xl text-text-secondary mb-12 font-medium leading-relaxed max-w-xl">
                Experience ultra-scalable multi-tenant architecture designed to handle high transaction volumes with sub-millisecond precision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 mb-16">
                {enterprisePoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-bold text-text opacity-90 text-sm tracking-tight">{point}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all text-lg">
                Enterprise Onboarding <Zap size={20} fill="currentColor" />
              </Link>
            </div>

            <div className="relative w-full h-[550px] flex items-center justify-center lg:justify-end md:pl-10 lg:pl-0 perspective-[2000px]">
               {/* Decorative background aura */}
               <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-70"></div>
               
               <div className="relative w-full max-w-md lg:max-w-lg z-10 transition-transform duration-1000 ease-out hover:rotate-y-[2deg] hover:-rotate-x-[2deg] group/stack">
                 
                 {/* Card 1 - Top Offset */}
                 <div className="absolute -top-16 md:-top-24 right-0 md:-right-6 w-[85%] p-6 bg-surface/80 backdrop-blur-2xl border border-border rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-4 hover:shadow-[0_25px_50px_-15px_rgba(37,99,235,0.15)] hover:border-primary/30 transition-all duration-700 z-0 cursor-default group/card1">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-bg border border-border text-primary rounded-[20px] flex items-center justify-center shrink-0 group-hover/card1:bg-primary group-hover/card1:text-white transition-all duration-500 shadow-sm"><Database size={24} /></div>
                     <div>
                       <h5 className="font-bold text-text text-sm md:text-base mb-1">Centralized Ledger</h5>
                       <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed opacity-80">Real-time double-entry accounting engine.</p>
                     </div>
                   </div>
                 </div>

                 {/* Card 2 - Main focal point (Center) */}
                 <div className="relative w-full p-8 bg-bg border border-border rounded-[36px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] z-20 overflow-hidden group/card2 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.25)] hover:border-primary/50 transition-all duration-700 cursor-default flex flex-col">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/card2:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                   
                   <div className="relative z-10">
                     <div className="flex items-start justify-between mb-8">
                       <div className="flex items-center gap-5">
                         <div className="w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center shrink-0 shadow-xl shadow-primary/30"><Globe size={28} className="text-white" /></div>
                         <div>
                           <h5 className="font-bold text-text text-xl tracking-tight mb-2">Compliance Hub</h5>
                           <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit shadow-sm">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Sync
                           </div>
                         </div>
                       </div>
                       <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-colors shadow-sm shrink-0">
                         <MoreHorizontal size={20} />
                       </button>
                     </div>
                     <p className="text-sm text-text-secondary leading-relaxed font-medium mb-8">
                       Automated GAAP, IFRS, and local tax standard compilation operating harmoniously across multiple jurisdictions.
                     </p>
                     
                     {/* Mini graph/data viz mockup */}
                     <div className="w-full h-28 bg-surface/50 border border-border/50 rounded-2xl flex items-end justify-between p-4 gap-2.5 lg:gap-3 group-hover/card2:bg-surface/80 group-hover/card2:border-primary/20 transition-all duration-500 overflow-hidden relative">
                        {/* Soft grid lines behind chart */}
                        <div className="absolute inset-x-0 bottom-1/2 w-full h-[1px] bg-border/40"></div>
                        <div className="absolute inset-x-0 bottom-3/4 w-full h-[1px] bg-border/40"></div>

                        {[40, 75, 55, 90, 65, 100, 85].map((h, j) => (
                           <div key={j} className="w-full bg-border rounded-t-sm group-hover/card2:bg-primary/20 transition-colors duration-700 relative z-10 flex items-end" style={{ height: `${h}%`, transitionDelay: `${j * 50}ms` }}>
                             <div className="w-full bg-text-secondary group-hover/card2:bg-primary rounded-t-sm transition-all duration-700 shadow-sm" style={{ height: `${h * 0.4}%`, transitionDelay: `${j * 50}ms` }}></div>
                           </div>
                        ))}
                     </div>
                   </div>
                 </div>

                 {/* Card 3 - Bottom Offset */}
                 <div className="absolute -bottom-16 md:-bottom-24 left-0 md:-left-6 w-[85%] p-6 bg-surface/80 backdrop-blur-2xl border border-border rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:translate-y-4 hover:shadow-[0_25px_50px_-15px_rgba(37,99,235,0.15)] hover:border-primary/30 transition-all duration-700 z-0 cursor-default group/card3">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-bg border border-border text-text-secondary rounded-[20px] flex items-center justify-center shrink-0 group-hover/card3:text-primary group-hover/card3:border-primary/30 transition-all duration-500 shadow-sm"><ShieldCheck size={24} /></div>
                     <div>
                       <h5 className="font-bold text-text text-sm md:text-base mb-1">Audit Tracking</h5>
                       <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed opacity-80">Cryptographic logs and full financial traceability.</p>
                     </div>
                   </div>
                 </div>

               </div>
            </div>
          </div>
        </section>

        {/* Strong Banner */}
        <section className="py-24 px-8 md:px-20">
          <div className="max-w-7xl mx-auto py-20 px-10 md:px-24 bg-primary rounded-[48px] overflow-hidden relative shadow-[0_48px_100px_-24px_rgba(37,99,235,0.4)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-white relative z-10">
              <div className="max-w-2xl text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to consolidate your financial core?</h2>
                <p className="text-white/80 font-medium text-lg leading-relaxed">Join 500+ enterprises managing complex ledgers with sub-millisecond precision and reliability.</p>
              </div>
              <Link to="/signup" className="flex-shrink-0 bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
                Start Free Trial <ArrowRight size={22} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-bg py-24 px-8 md:px-24 border-t border-border mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl font-bold italic tracking-tighter shadow-xl shadow-primary/40 border border-white/10 shrink-0">UV</div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl tracking-tight text-text leading-tight">UV Netware</span>
                  <span className="text-primary font-black text-sm tracking-[0.3em] uppercase">Utilities</span>
                </div>
              </div>
              <p className="text-text-secondary max-w-sm font-medium text-lg leading-relaxed opacity-90">
                The unified system of record for the next generation of agile enterprises. Multi-standard, multi-tenant.
              </p>
            </div>
            <div>
              <h4 className="font-black text-[11px] mb-8 uppercase tracking-[0.3em] text-text border-l-4 border-primary pl-4">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-text-secondary">
                <li><Link to="#" className="hover:text-primary transition-colors">Infrastructure</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">API Reference</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Status Board</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-[11px] mb-8 uppercase tracking-[0.3em] text-text border-l-4 border-primary pl-4">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-text-secondary">
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Council</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Terms of Utility</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-text-secondary font-black uppercase tracking-[0.25em] gap-6">
            <span>© 2026 UV NETWARE UTILITIES. ENGINEERED FOR SUPREMACY.</span>
            <div className="flex items-center gap-3 px-4 py-2 bg-bg border border-border rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-text tracking-[0.3em]">Network Active</span>
            </div>
          </div>
        </footer>
      </div>

      <Outlet />
    </div>
  );
};

export default Landing;
