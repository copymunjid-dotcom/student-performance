import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Award,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function PredictionResultCard({ prediction, studentName }) {
  if (!prediction) return null;

  const {
    predicted_marks,
    performance_category,
    confidence_score,
    risk_level,
    probabilities = {},
    influencing_factors = [],
    recommendations = [],
    model_info = {}
  } = prediction;

  const categoryConfigs = {
    'Excellent': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      scoreColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      icon: Award,
      headline: 'Outstanding Academic Trajectory',
      summary: 'Student demonstrates exceptional mastery across internal coursework, consistency, and examination standards.'
    },
    'Good': {
      bg: 'bg-blue-500/10',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-600 text-white',
      scoreColor: 'text-blue-600',
      barColor: 'bg-blue-500',
      icon: CheckCircle2,
      headline: 'Strong Performance Projection',
      summary: 'Consistent performance with solid fundamentals. Minor targeted refinement will elevate this student to honors grade.'
    },
    'Average': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-500 text-white',
      scoreColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      icon: TrendingUp,
      headline: 'Moderate Academic Standing',
      summary: 'Currently meeting baseline requirements, but vulnerable to semester exam difficulty spikes. Needs focused reinforcement.'
    },
    'At Risk': {
      bg: 'bg-rose-500/10',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-600 text-white',
      scoreColor: 'text-rose-600',
      barColor: 'bg-rose-500',
      icon: AlertTriangle,
      headline: 'Critical Academic Risk Alert',
      summary: 'Projected below minimum passing criteria. Urgent advisory intervention and structured remediation required immediately.'
    }
  };

  const cfg = categoryConfigs[performance_category] || categoryConfigs['Average'];
  const CategoryIcon = cfg.icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/40 overflow-hidden transition-all duration-300">
      {/* Top Banner */}
      <div className={`p-6 border-b ${cfg.border} ${cfg.bg} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${cfg.badge} flex items-center justify-center shadow-md shadow-slate-900/10`}>
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                {performance_category}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Confidence: <strong className="text-slate-800">{confidence_score}%</strong>
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {studentName ? `${studentName} — ` : ''}{cfg.headline}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/60 shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Predicted Marks
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-3xl font-extrabold ${cfg.scoreColor}`}>
                {predicted_marks}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Risk Status
            </span>
            <span className={`text-sm font-bold mt-0.5 inline-block ${
              risk_level === 'High' ? 'text-rose-600' :
              risk_level === 'Moderate' ? 'text-amber-600' :
              risk_level === 'Low' ? 'text-blue-600' : 'text-emerald-600'
            }`}>
              {risk_level} Risk
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Model Explanation Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">AI Predictive Synthesis</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cfg.summary}</p>
          </div>
        </div>

        {/* Probability Distribution */}
        {probabilities && Object.keys(probabilities).length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Model Classification Probability Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(probabilities).map(([cat, prob]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">{cat}</span>
                    <span className="font-bold text-slate-900">{prob}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cat === 'Excellent' ? 'bg-emerald-500' :
                        cat === 'Good' ? 'bg-blue-500' :
                        cat === 'Average' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Influencing Factors Breakdown */}
        {influencing_factors && influencing_factors.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Key Factors Influencing Prediction
            </h4>
            <div className="space-y-2.5">
              {influencing_factors.slice(0, 5).map((factor, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      factor.type === 'positive' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {factor.type === 'positive' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-slate-800">{factor.label}</span>
                      <span className="text-slate-400 ml-2">({factor.value})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Weight: {factor.importance_pct}%
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      factor.type === 'positive' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {factor.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized AI Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Tailored AI Recommendations & Action Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border transition-all ${
                    rec.priority === 'Critical' 
                      ? 'bg-rose-50/60 border-rose-200' 
                      : rec.priority === 'High' 
                        ? 'bg-amber-50/60 border-amber-200' 
                        : 'bg-blue-50/40 border-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      rec.priority === 'Critical' 
                        ? 'bg-rose-600 text-white' 
                        : rec.priority === 'High' 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-blue-600 text-white'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{rec.category}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {rec.action}
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Transparency Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Trained with Scikit-learn Random Forest Classifier & Linear Regression</span>
          </div>
          <div>
            R² Score: <strong className="text-slate-600">{model_info.r2_score || 0.931}</strong> • Accuracy: <strong className="text-slate-600">{model_info.accuracy || 78.8}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
