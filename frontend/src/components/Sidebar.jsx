import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BrainCircuit, 
  AlertTriangle, 
  FileText, 
  LogOut, 
  Sparkles,
  School,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Student Management', path: '/students', icon: Users },
    { name: 'Academic Records', path: '/performance', icon: GraduationCap },
    { name: 'AI Performance Prediction', path: '/predict', icon: BrainCircuit, highlight: true },
    { name: 'Student Risk Analysis', path: '/risk-analysis', icon: AlertTriangle, badge: 'Alerts' },
    { name: 'Reports & Export', path: '/reports', icon: FileText }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-1.5">
                EduPredict <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </h1>
              <p className="text-[11px] font-medium text-slate-400">AI Student Analytics</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : item.highlight 
                      ? 'text-blue-300 hover:bg-slate-800/80 hover:text-white' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.highlight ? 'text-blue-400' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            AI ML Engine Status
          </div>
          <div className="mx-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Models Online
              </span>
              <span className="text-blue-400 font-semibold text-[11px]">v1.0-RF</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Random Forest Classifier & Linear Ridge Regressor active.
            </p>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold flex items-center justify-center text-sm shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Academic User'}</p>
                <p className="text-[11px] text-slate-400 truncate capitalize">{user?.role || 'Educator'} • {user?.department || 'Faculty'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
