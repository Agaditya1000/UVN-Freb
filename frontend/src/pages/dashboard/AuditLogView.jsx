import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../services/supabase';
import { 
  History, 
  Database, 
  User, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';

const AuditLogView = () => {
  const { activeBusiness, userRole } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBusiness) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [activeBusiness]);

  if (userRole !== 'Owner') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <ShieldAlert size={64} className="text-red-500 opacity-50" />
        <h2 className="text-2xl font-black text-text uppercase">Restricted Access</h2>
        <p className="text-text-secondary font-medium">Only the Business Owner can view security audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
              <History size={24} />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text">Audit Log</h2>
          </div>
          <p className="text-text-secondary font-medium text-sm max-w-md">
            Security history tracking all ledger modifications for <span className="text-text font-bold">{activeBusiness?.name}</span>.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="divide-y divide-border/50">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-xs font-black uppercase text-text-secondary tracking-widest">Loading history...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center">
              <Database size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
              <p className="text-sm font-bold text-text-secondary">No activity recorded yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 md:p-8 hover:bg-bg/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-2xl ${
                      log.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-600' :
                      log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      <Database size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-border/50 text-text-secondary">
                          {log.table_name}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          log.action === 'INSERT' ? 'text-emerald-500' :
                          log.action === 'UPDATE' ? 'text-amber-500' :
                          'text-red-500'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-text">
                        {log.action === 'INSERT' ? 'New record created' : 
                         log.action === 'UPDATE' ? 'Record updated' : 'Record permanently deleted'}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-text-secondary font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={12} />
                          User: {log.user_id?.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {log.action === 'UPDATE' && (
                    <div className="flex items-center gap-3 text-text-secondary opacity-50">
                       <div className="text-[9px] font-black uppercase tracking-tighter">DATA CHANGE</div>
                       <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
