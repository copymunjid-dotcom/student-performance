import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('department'); // 'department' | 'prediction' | 'attendance' | 'all'

  useEffect(() => {
    api.getReports()
      .then(res => setReportData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (!reportData || !reportData.student_records) return;

    const records = reportData.student_records;
    const headers = [
      'Student ID',
      'Student Name',
      'Department',
      'Academic Year',
      'Semester',
      'Attendance %',
      'Previous Semester Marks',
      'Internal Assessment Marks',
      'Assignment Scores',
      'Daily Study Hours',
      'Predicted Final Marks',
      'Performance Category',
      'Risk Level',
      'Confidence Score'
    ];

    const rows = records.map(r => [
      r.student_id,
      `"${r.student_name}"`,
      `"${r.department}"`,
      r.academic_year,
      r.semester,
      r.attendance_percentage,
      r.previous_semester_marks,
      r.internal_assessment_marks,
      r.assignment_scores,
      r.study_hours_per_day,
      r.predicted_marks,
      r.performance_category,
      r.risk_level,
      r.confidence_score
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Performance_AI_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Performance & Prediction Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Export comprehensive institutional intelligence, department summaries, and student registries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download CSV Data</span>
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Printable PDF Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 max-w-xl text-xs font-semibold no-print">
        <button
          onClick={() => setActiveTab('department')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'department' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Department Overview
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'prediction' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Prediction Registry
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'attendance' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Compliance
        </button>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Official University Intelligence Report
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Student Performance Prediction & Academic Risk Dossier</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated by EduPredict AI System &bull; Machine Learning Division
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p className="font-semibold text-slate-600">Date: {reportData?.generated_at || new Date().toLocaleString()}</p>
            <p className="text-[11px]">Academic Term: Fall 2026</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Generating report tables...</p>
          </div>
        ) : (
          <>
            {/* 1. Department Summary Tab */}
            {activeTab === 'department' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Departmental Academic Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3 text-center">Enrolled</th>
                        <th className="px-4 py-3 text-center">Avg Attendance</th>
                        <th className="px-4 py-3 text-center">Avg Historical Marks</th>
                        <th className="px-4 py-3 text-center">Avg Predicted Marks</th>
                        <th className="px-4 py-3 text-center">At-Risk Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData?.department_reports?.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-bold text-slate-800">{dept.department}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">{dept.student_count}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${dept.average_attendance < 75 ? 'text-amber-600' : 'text-slate-800'}`}>
                              {dept.average_attendance}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">{dept.average_marks}%</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">{dept.average_predicted}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              dept.at_risk_count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {dept.at_risk_count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Prediction Registry Tab */}
            {activeTab === 'prediction' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Prediction Classification Audit
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3 text-center">Predicted Marks</th>
                        <th className="px-4 py-3 text-center">Category</th>
                        <th className="px-4 py-3 text-center">Risk Tier</th>
                        <th className="px-4 py-3 text-center">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData?.student_records?.map((stu, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-bold text-slate-800">{stu.student_name}</td>
                          <td className="px-4 py-3 text-slate-500">{stu.student_id}</td>
                          <td className="px-4 py-3 text-slate-700">{stu.department}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-blue-600">{stu.predicted_marks}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              stu.performance_category === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                              stu.performance_category === 'Good' ? 'bg-blue-100 text-blue-800' :
                              stu.performance_category === 'Average' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {stu.performance_category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">{stu.risk_level}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-500">{stu.confidence_score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Attendance Compliance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Mandatory Attendance Audit (75% Minimum Required)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3 text-center">Attendance %</th>
                        <th className="px-4 py-3 text-center">Study Hours</th>
                        <th className="px-4 py-3 text-center">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData?.student_records?.map((stu, idx) => {
                        const isCompliant = stu.attendance_percentage >= 75;
                        const isCritical = stu.attendance_percentage < 65;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-bold text-slate-800">{stu.student_name} ({stu.student_id})</td>
                            <td className="px-4 py-3 text-slate-600">{stu.department}</td>
                            <td className="px-4 py-3 text-center font-extrabold">
                              {stu.attendance_percentage}%
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-slate-600">{stu.study_hours_per_day} hrs/day</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCritical ? 'bg-rose-100 text-rose-800' :
                                !isCompliant ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isCritical ? 'Critical Deficit' : !isCompliant ? 'Warning Level' : 'Eligible'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
