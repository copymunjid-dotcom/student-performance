import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'blue' // 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo'
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-100',
      glow: 'shadow-blue-500/5'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      glow: 'shadow-emerald-500/5'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-100',
      glow: 'shadow-amber-500/5'
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-100',
      glow: 'shadow-rose-500/5'
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      glow: 'shadow-indigo-500/5'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${scheme.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center shrink-0`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendType === 'positive' 
              ? 'bg-emerald-50 text-emerald-600' 
              : trendType === 'negative' 
                ? 'bg-rose-50 text-rose-600' 
                : 'bg-slate-100 text-slate-600'
          }`}>
            {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
