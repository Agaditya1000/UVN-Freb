import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

const features = [
  {
    icon: <Globe className="text-white w-8 h-8 font-light" />,
    title: 'Multi-Standard Compliance',
    desc: 'GAAP, IFRS, and IND-AS/GST support out of the box for global operations.',
  },
  {
    icon: <ShieldCheck className="text-white w-8 h-8 font-light" />,
    title: 'Role-Based Access',
    desc: 'Granular permissions for Owners, Accountants, and Viewers — no over-exposure.',
  },
  {
    icon: <RefreshCw className="text-white w-8 h-8 font-light" />,
    title: 'Real-Time Sync',
    desc: 'Changes propagate instantly across your team with zero config required.',
  },
  {
    icon: <FileText className="text-white w-8 h-8 font-light" />,
    title: 'Smart Reporting',
    desc: 'Generate audit-ready reports with a single click. Export to PDF or Excel.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-lightWhite font-roboto font-light antialiased flex flex-col uppercase-none shadow-none">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b-[1.75px] border-borderDark bg-naviBlue shadow-none">
        <div className="flex items-center gap-3">
          <span className="font-medium text-xl text-white tracking-heading">UV Netware Accounting Utilities</span>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/login" 
            className="px-6 py-2 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="px-6 py-2 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-black shadow-none border-none">
        
        <div className="border-[1.75px] border-borderDark bg-naviBlue px-6 py-3 mb-8 inline-block shadow-none">
          <span className="font-medium text-white tracking-heading uppercase">Enterprise Financial Management Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-medium text-white tracking-heading leading-tight max-w-4xl mb-6">
          Accounting built for modern teams
        </h1>
        
        <p className="text-lg text-grayText max-w-2xl mb-12 font-light">
          Manage documents, databases, and compliance workflows — all in one secure, role-aware platform designed for finance teams.
        </p>
        
        <div className="flex gap-4">
          <Link 
            to="/signup" 
            className="px-8 py-3 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
          >
            Start for free
          </Link>
        </div>
        
        {/* Stats Strip */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 border-[1.75px] border-borderDark bg-naviBlue p-8 max-w-4xl w-full shadow-none relative">
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: 'SOC 2', label: 'Certified' },
            { value: '3 Standards', label: 'GAAP · IFRS · IND-AS' },
            { value: '< 1s', label: 'Sync Speed' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-medium text-white tracking-heading mb-2">{stat.value}</div>
              <div className="text-sm text-grayText uppercase tracking-heading font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 md:px-12 bg-black border-t-[1.75px] border-borderDark border-b-[1.75px] shadow-none">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-medium text-white tracking-heading mb-4">Everything your finance team needs</h2>
          <p className="text-grayText max-w-2xl mx-auto font-light">From compliance to real-time collaboration, UVN SaaS is built around the way modern accounting teams operate.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className="bg-naviBlue border-[1.75px] border-borderDark p-8 shadow-none transition-none">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-lg font-medium text-white tracking-heading mb-3">{feature.title}</h3>
              <p className="text-lightWhite leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-24 px-6 md:px-12 bg-black shadow-none border-b-[1.75px] border-borderDark flex justify-center">
        <div className="bg-naviBlue border-[1.75px] border-borderDark p-16 max-w-4xl w-full text-center shadow-none flex flex-col items-center">
          <h2 className="text-4xl font-medium text-white tracking-heading mb-6">
            Ready to modernize your accounting?
          </h2>
          <p className="text-lightWhite mb-10 max-w-lg font-light">
            Join forward-thinking finance teams who trust UVN SaaS to keep their books clean and compliant.
          </p>
          <Link 
            to="/signup" 
            className="px-8 py-3 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-[1.75px] border-borderDark bg-naviBlue py-6 px-12 flex justify-between items-center text-sm shadow-none text-grayText font-light">
        <span>© 2026 UVN SaaS. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="#" className="font-light hover:text-white transition-none">Privacy</Link>
          <Link to="#" className="font-light hover:text-white transition-none">Terms</Link>
          <Link to="#" className="font-light hover:text-white transition-none">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
