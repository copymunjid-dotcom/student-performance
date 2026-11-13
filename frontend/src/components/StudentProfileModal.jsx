import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentProfileModal({ isOpen, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      api.getStudentById(studentId)
        .then(res => {
          setData(res);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-base">
              {data?.student?.student_name ? data.student.student_name.charAt(0) : 'S'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {data?.student?.student_name || 'Loading Profile...'}
                {data?.student?.enrollment_status && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {data.student.enrollment_status}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Roll No: {data?.student?.student_id} • {data?.student?.department}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Loading student dossier...</p>
            </div>
          ) : (
            <>
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Email</span>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{data.student.email}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Academic Year</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{data.student.academic_year} (Sem {data.student.semester})</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gender</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{data.student.gender || 'Not specified'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Phone</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{data.student.phone || 'N/A'}</p>
                </div>
              </div>

              {/* AI Prediction Overview Banner */}
              {data.latest_prediction && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        Latest AI Prediction
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        Projected Score: <span className="text-blue-600 font-extrabold">{data.latest_prediction.predicted_marks}%</span>
                        {' '}&bull; Category: <span className="text-slate-800">{data.latest_prediction.performance_category}</span>
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      data.latest_prediction.risk_level === 'High' ? 'bg-rose-100 text-rose-700' :
                      data.latest_prediction.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                      data.latest_prediction.risk_level === 'Low' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {data.latest_prediction.risk_level} Risk
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {data.latest_prediction.confidence_score}% Confidence
                    </span>
                  </div>
                </div>
              )}

              {/* Academic Performance Record */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Academic History & Metrics
                </h4>
                {data.performance_history?.length > 0 ? (
                  <div className="space-y-3">
                    {data.performance_history.map((perf, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                          <span>Semester {perf.recorded_semester} ({perf.academic_term})</span>
                          <span className="text-slate-400 text-[11px]">{new Date(perf.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Attendance</span>
                            <span className="text-xs font-bold text-slate-800">{perf.attendance_percentage}%</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Prev Marks</span>
                            <span className="text-xs font-bold text-slate-800">{perf.previous_semester_marks}%</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Internal</span>
                            <span className="text-xs font-bold text-slate-800">{perf.internal_assessment_marks}%</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Assignments</span>
                            <span className="text-xs font-bold text-slate-800">{perf.assignment_scores}%</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Study Time</span>
                            <span className="text-xs font-bold text-slate-800">{perf.study_hours_per_day}h / day</span>
                          </div>
                        </div>

                        {/* Subject marks breakdown */}
                        {perf.subject_marks && Object.keys(perf.subject_marks).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200/60">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                              Subject-Wise Grades
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(perf.subject_marks).map(([subj, score]) => (
                                <span key={subj} className="text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                                  {subj}: <strong className="text-slate-900">{score}%</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No historical records available.</p>
                )}
              </div>

              {/* Personalized AI Recommendations */}
              {data.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Personalized AI Interventions
                  </h4>
                  <div className="space-y-2">
                    {data.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              rec.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                              rec.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="font-semibold text-slate-800">{rec.action}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{rec.recommendation_text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">{rec.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
