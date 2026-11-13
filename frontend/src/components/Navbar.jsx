import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  BrainCircuit, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onOpenSidebar }) {
  const { user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'At-Risk Alert', text: 'Marcus Chen attendance dropped below 60%', time: '10m ago', urgent: true },
    { id: 2, title: 'Prediction Updated', text: 'Model re-evaluated 20 student profiles', time: '1h ago', urgent: false },
    { id: 3, title: 'ML Performance', text: 'Random Forest achieved 93.1% R2 accuracy', time: '2h ago', urgent: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-sm text-slate-500 w-72 focus-within:w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, roll no, subjects..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/students?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* ML Engine Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Scikit-Learn ML Active</span>
        </div>

        {/* DB Mode Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
          <Database className="w-3 h-3 text-slate-500" />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local SQLite + ML'}</span>
        </div>

        {/* Quick Predict Action */}
        <button
          onClick={() => navigate('/predict')}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-600/30 transition-all hover:shadow-md"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Predict Performance</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      {n.urgent ? (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar button */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.full_name ? user.full_name.charAt(0) : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
