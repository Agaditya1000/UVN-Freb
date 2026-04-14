import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  User,
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Mail, 
  UserCircle,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AssignedUsers = () => {
  const { user } = useAuth();
  const { activeBusiness, userRole, team, assignUser, revokeUser, createInviteLink, loading } = useApp();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [detectedUser, setDetectedUser] = useState(null);

  // Smart Role Lookup
  useEffect(() => {
    const lookupUser = async () => {
      if (!email || !email.includes('@')) {
        setDetectedUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('email', email)
        .single();

      if (!error && data) {
        setDetectedUser(data);
        // Auto-select their registered role
        setRole(data.role);
      } else {
        setDetectedUser(null);
      }
    };

    const timeoutId = setTimeout(lookupUser, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Security: Only owners can access this page
  if (!loading && userRole !== 'Owner') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!activeBusiness && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-surface border border-border rounded-3xl flex items-center justify-center text-text-secondary opacity-20">
          <Users size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text">Select Business Context</h2>
          <p className="text-text-secondary text-sm max-w-xs mx-auto font-medium">
            You must select a business unit from the top navigation menu before you can manage team access.
          </p>
        </div>
      </div>
    );
  }

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!email) return;

    // 1. Check if already assigned locally first
    const isAlreadyAssigned = team.some(m => m.users?.email?.toLowerCase() === email.toLowerCase());
    if (isAlreadyAssigned) {
      setStatus({ type: 'error', msg: 'This user is already a member of your team.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });

    const result = await assignUser(email, role);
    setIsSubmitting(false);

    if (result.success) {
      setStatus({ type: 'success', msg: `Successfully assigned ${email} as ${role}` });
      setEmail('');
      setDetectedUser(null);
    } else {
      let errorMessage = result.error?.message || result.error || 'Failed to assign user.';
      
      // Friendly message for duplicate key constraint
      if (errorMessage.includes('unique_constraint') || errorMessage.includes('duplicate key')) {
        errorMessage = 'This user is already a member of your team.';
      }

      setStatus({ 
        type: 'error', 
        msg: errorMessage
      });
    }
  };

  const handleRevoke = async (userId, userEmail) => {
    if (userId === user.id) {
      alert("You cannot revoke your own access.");
      return;
    }

    if (window.confirm(`Are you sure you want to revoke access for ${userEmail}?`)) {
      const result = await revokeUser(userId);
      if (!result.success) {
        alert("Failed to revoke access.");
      }
    }
  };

  const handleGenerateLink = async () => {
    const result = await createInviteLink(role);
    if (result.success) {
      setGeneratedLink(result.link);
      navigator.clipboard.writeText(result.link);
      setStatus({ type: 'success', msg: `Link copied! Send it to your ${role}.` });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
              <Users size={24} />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text">Team Access</h2>
          </div>
          <p className="text-text-secondary font-medium text-sm max-w-md">
            Manage who has access to <span className="text-text font-bold">{activeBusiness?.name}</span> and their respective permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ASSIGNMENT FORM */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-lg">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-lg font-bold text-text">Assign New Role</h3>
              </div>

              <form onSubmit={handleAssign} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="accountant@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-secondary/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Access Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Accountant', 'Viewer'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                          role === r 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                          : 'bg-bg text-text-secondary border-border hover:border-primary/50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {detectedUser && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-xl">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        Matched registered {detectedUser.role}: {detectedUser.full_name}
                      </span>
                    </div>
                  )}
                </div>

                {status.msg && (
                  <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {status.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Assign Access
                </button>
              </form>
            </div>
          </div>
          
          <div className="bg-bg border border-border p-6 rounded-3xl flex items-start gap-4">
             <div className="p-2 bg-text-secondary/10 text-text-secondary rounded-lg">
                <ShieldCheck size={18} />
             </div>
             <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Permissions Summary</p>
                <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                  <span className="text-text font-bold">Accountants</span> can record transactions and edit accounts. <span className="text-text font-bold">Viewers</span> are read-only.
                </p>
             </div>
          </div>

          <div className="bg-surface border border-primary/20 p-8 rounded-[2.5rem] shadow-lg space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <LinkIcon size={18} />
                </div>
                <h3 className="text-lg font-bold text-text">Invite via Link</h3>
             </div>
             <p className="text-[11px] text-text-secondary font-medium">
               Send a link manually if the user isn't registered on the platform yet.
             </p>
             <button
               onClick={handleGenerateLink}
               className="w-full py-3 bg-bg border border-primary/30 text-primary hover:bg-primary/[0.03] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
             >
               <Copy size={16} />
               Generate & Copy Link
             </button>
             {generatedLink && (
               <div className="p-3 bg-bg/50 border border-border rounded-xl text-[10px] text-text-secondary font-mono truncate">
                 {generatedLink}
               </div>
             )}
          </div>
        </div>

        {/* TEAM MEMBER LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
             <div className="px-8 py-6 border-b border-border bg-slate-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Active Assignments ({team.length})</h4>
                </div>
             </div>

             <div className="divide-y divide-border/50">
                {team.length === 0 && !loading && (
                  <div className="p-20 text-center space-y-4">
                    <UserCircle size={48} className="mx-auto text-text-secondary opacity-20" />
                    <p className="text-sm font-bold text-text-secondary">No additional members assigned yet.</p>
                  </div>
                )}

                {team.map((member) => (
                  <div key={member.user_id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-bg/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface border border-border shadow-inner flex items-center justify-center text-primary relative">
                        <User size={20} />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center ${member.role === 'Owner' ? 'bg-amber-500' : 'bg-primary'}`}>
                           <ShieldCheck size={8} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text">{member.users?.email}</p>
                          {member.user_id === user.id && (
                            <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">You</span>
                          )}
                          {member.users?.role && member.role !== member.users.role && (
                             <span className="text-[8px] font-black text-text-secondary/50 uppercase italic tracking-tighter">
                               Registered as {member.users.role}
                             </span>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-text-secondary mt-0.5 capitalize">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         member.role === 'Owner' 
                         ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' 
                         : 'border-primary/20 text-primary bg-primary/5'
                       }`}>
                         {member.role}
                       </div>
                       
                       {member.role !== 'Owner' && member.user_id !== user.id && (
                         <button 
                           onClick={() => handleRevoke(member.user_id, member.users?.email)}
                           className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                           title="Revoke Access"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedUsers;
