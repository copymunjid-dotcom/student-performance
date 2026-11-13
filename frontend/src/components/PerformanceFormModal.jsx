import React, { useState, useEffect } from 'react';
import { X, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function PerformanceFormModal({ isOpen, onClose, onSaved, student = null }) {
  const [formData, setFormData] = useState({
    student_id: '',
    attendance_percentage: 75.0,
    previous_semester_marks: 68.0,
    internal_assessment_marks: 70.0,
    assignment_scores: 72.0,
    study_hours_per_day: 3.5,
    completed_assignments: 8,
    total_assignments: 10,
    recorded_semester: 4,
    academic_term: 'Fall 2026',
    subjects: {
      'Mathematics': 70.0,
      'Data Structures': 74.0,
      'Database Systems': 76.0,
      'Operating Systems': 68.0,
      'Computer Networks': 72.0
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        attendance_percentage: student.attendance_percentage || 75.0,
        previous_semester_marks: student.previous_semester_marks || 68.0,
        internal_assessment_marks: student.internal_assessment_marks || 70.0,
        assignment_scores: student.assignment_scores || 72.0,
        study_hours_per_day: student.study_hours_per_day || 3.5,
        completed_assignments: student.completed_assignments || 8,
        total_assignments: student.total_assignments || 10,
        recorded_semester: student.semester || 4,
        academic_term: 'Fall 2026',
        subjects: {
          'Mathematics': Math.round(Number(student.previous_semester_marks || 70)),
          'Data Structures': Math.round(Number(student.internal_assessment_marks || 72)),
          'Database Systems': Math.round(Number(student.assignment_scores || 75)),
          'Operating Systems': Math.round(Number(student.previous_semester_marks || 68)),
          'Computer Networks': Math.round(Number(student.internal_assessment_marks || 70))
        }
      });
    }
    setError('');
    setSuccess('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subj, value) => {
    setFormData(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subj]: Number(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validation
    const att = Number(formData.attendance_percentage);
    const prev = Number(formData.previous_semester_marks);
    const internal = Number(formData.internal_assessment_marks);
    const assign = Number(formData.assignment_scores);
    const hours = Number(formData.study_hours_per_day);
    const comp = Number(formData.completed_assignments);
    const tot = Number(formData.total_assignments);

    if (att < 0 || att > 100) {
      setError('Attendance percentage must be between 0 and 100%.');
      return;
    }
    if (prev < 0 || prev > 100 || internal < 0 || internal > 100 || assign < 0 || assign > 100) {
      setError('Marks and scores must be within the 0 to 100 range.');
      return;
    }
    if (hours < 0 || hours > 24) {
      setError('Study hours must be between 0 and 24 hours per day.');
      return;
    }
    if (comp < 0 || comp > tot) {
      setError('Completed assignments cannot exceed total assignments.');
      return;
    }

    setLoading(true);
    try {
      await api.savePerformance({
        student_id: formData.student_id,
        attendance_percentage: att,
        previous_semester_marks: prev,
        internal_assessment_marks: internal,
        assignment_scores: assign,
        study_hours_per_day: hours,
        completed_assignments: comp,
        total_assignments: tot,
        recorded_semester: formData.recorded_semester,
        academic_term: formData.academic_term,
        subject_marks: formData.subjects
      });

      setSuccess('Academic performance saved! AI prediction recalculated.');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to record academic performance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Update Academic Performance
              </h3>
              <p className="text-xs text-slate-500">
                Student: {student?.student_name} ({student?.student_id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Core Numerical Metrics */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Core Assessment Indicators</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attendance % (0-100) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="attendance_percentage"
                  value={formData.attendance_percentage}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Previous Sem Marks *</label>
                <input
                  type="number"
                  step="0.1"
                  name="previous_semester_marks"
                  value={formData.previous_semester_marks}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Internal Assessment *</label>
                <input
                  type="number"
                  step="0.1"
                  name="internal_assessment_marks"
                  value={formData.internal_assessment_marks}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignment Scores *</label>
                <input
                  type="number"
                  step="0.1"
                  name="assignment_scores"
                  value={formData.assignment_scores}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Study Hours / Day *</label>
                <input
                  type="number"
                  step="0.5"
                  name="study_hours_per_day"
                  value={formData.study_hours_per_day}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Completed Assignments</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    name="completed_assignments"
                    value={formData.completed_assignments}
                    onChange={handleChange}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-400">/</span>
                  <input
                    type="number"
                    name="total_assignments"
                    value={formData.total_assignments}
                    onChange={handleChange}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subject-Wise Breakdown */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Subject-Wise Examination Marks (0-100)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(formData.subjects).map(([subj, val]) => (
                <div key={subj}>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{subj}</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => handleSubjectChange(subj, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>Save & Re-evaluate AI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
