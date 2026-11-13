import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  Search, 
  Filter, 
  ArrowRight, 
  Mail, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import StudentProfileModal from '../components/StudentProfileModal';

export default function RiskAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('All');
  const [search, setSearch] = useState('');
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskAnalysis();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (studentName, actionType) => {
    setActionNotice(`Intervention triggered for ${studentName}: "${actionType}" dispatched to academic advisory.`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  const filteredStudents = data?.students_risk?.filter(stu => {
    const matchesRisk = filterRisk === 'All' || stu.risk_level === filterRisk;
    const matchesSearch = !search || 
      stu.student_name.toLowerCase().includes(search.toLowerCase()) ||
      stu.student_id.toLowerCase().includes(search.toLowerCase()) ||
      stu.department.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-rose-950/10 flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-400/30 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>Academic Early Warning System</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student Risk Analysis & Triage</h2>
          <p className="text-xs sm:text-sm text-rose-100/90 mt-1.5 leading-relaxed">
            Machine Learning identifies students showing early signs of academic decline. Predictions inform educator interventions without automating final determinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-rose-200 uppercase font-semibold block">Critical Tier</span>
            <span className="text-2xl font-black text-white">{data?.summary?.High || 0}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-amber-200 uppercase font-semibold block">Moderate Tier</span>
            <span className="text-2xl font-black text-white">{data?.summary?.Moderate || 0}</span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search at-risk students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Risk Level Filter:</span>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            {['All', 'High', 'Moderate', 'Low', 'Safe'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterRisk === lvl 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Triage Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Compiling risk analysis triage...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700">No students match this criteria</p>
            <p className="text-slate-400 mt-1">Try switching risk filter or clearing search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5 text-center">Attendance</th>
                  <th className="px-4 py-3.5 text-center">Current Avg</th>
                  <th className="px-4 py-3.5 text-center">Predicted Marks</th>
                  <th className="px-4 py-3.5 text-center">Risk Tier</th>
                  <th className="px-5 py-3.5">AI Recommended Action</th>
                  <th className="px-5 py-3.5 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const isHigh = stu.risk_level === 'High';
                  const isMod = stu.risk_level === 'Moderate';

                  return (
                    <tr 
                      key={stu.student_id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHigh ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                            isHigh ? 'bg-rose-100 text-rose-700' :
                            isMod ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {stu.student_name.charAt(0)}
                          </div>
                          <div>
                            <p 
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                              onClick={() => setProfileStudentId(stu.student_id)}
                            >
                              {stu.student_name}
                            </p>
                            <p className="text-[11px] text-slate-400">{stu.student_id} &bull; {stu.department}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          stu.attendance_percentage < 65 ? 'bg-rose-100 text-rose-700' :
                          stu.attendance_percentage < 75 ? 'bg-amber-100 text-amber-700' : 'text-slate-800'
                        }`}>
                          {stu.attendance_percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {stu.average_marks}%
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-extrabold ${
                          stu.predicted_marks < 50 ? 'text-rose-600' :
                          stu.predicted_marks < 65 ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {stu.predicted_marks}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                          isHigh ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          isMod ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          stu.risk_level === 'Low' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {stu.risk_level} Risk
                        </span>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {stu.recommended_action}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleAction(stu.student_name, stu.recommended_action)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                            isHigh 
                              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Trigger Plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentProfileModal
        isOpen={Boolean(profileStudentId)}
        onClose={() => setProfileStudentId(null)}
        studentId={profileStudentId}
      />
    </div>
  );
}
