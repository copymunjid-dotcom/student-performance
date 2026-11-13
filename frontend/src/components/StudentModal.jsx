import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function StudentModal({ isOpen, onClose, onSaved, student = null }) {
  const isEdit = Boolean(student);
  
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    email: '',
    department: 'Computer Science',
    academic_year: 'Year 2',
    semester: 4,
    gender: 'Prefer not to say',
    phone: '',
    attendance_percentage: 75.0,
    previous_semester_marks: 68.0,
    internal_assessment_marks: 70.0,
    assignment_scores: 72.0,
    study_hours_per_day: 3.5,
    completed_assignments: 8,
    total_assignments: 10
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id || '',
        student_name: student.student_name || '',
        email: student.email || '',
        department: student.department || 'Computer Science',
        academic_year: student.academic_year || 'Year 2',
        semester: student.semester || 4,
        gender: student.gender || 'Prefer not to say',
        phone: student.phone || '',
        attendance_percentage: student.attendance_percentage || 75.0,
        previous_semester_marks: student.previous_semester_marks || 68.0,
        internal_assessment_marks: student.internal_assessment_marks || 70.0,
        assignment_scores: student.assignment_scores || 72.0,
        study_hours_per_day: student.study_hours_per_day || 3.5,
        completed_assignments: student.completed_assignments || 8,
        total_assignments: student.total_assignments || 10
      });
    } else {
      setFormData({
        student_id: `STU${Math.floor(100 + Math.random() * 900)}`,
        student_name: '',
        email: '',
        department: 'Computer Science',
        academic_year: 'Year 2',
        semester: 4,
        gender: 'Prefer not to say',
        phone: '',
        attendance_percentage: 75.0,
        previous_semester_marks: 68.0,
        internal_assessment_marks: 70.0,
        assignment_scores: 72.0,
        study_hours_per_day: 3.5,
        completed_assignments: 8,
        total_assignments: 10
      });
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.student_name.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('A valid student email is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.updateStudent(student.student_id, formData);
      } else {
        await api.addStudent(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save student details.');
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update student info and academic metrics' : 'Enter student profile and baseline metrics'}
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

          {/* Core Identification */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Student Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Roll No *</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  disabled={isEdit}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="student_name"
                  placeholder="e.g. Jordan Smith"
                  value={formData.student_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Year 1">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2 (Sophomore)</option>
                  <option value="Year 3">Year 3 (Junior)</option>
                  <option value="Year 4">Year 4 (Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (1 - 8)</label>
                <input
                  type="number"
                  name="semester"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1-555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Baseline Metrics */}
          {!isEdit && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Baseline Academic Metrics (For ML Engine)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attendance % (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="attendance_percentage"
                    value={formData.attendance_percentage}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prev Sem Marks (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="previous_semester_marks"
                    value={formData.previous_semester_marks}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Internal Marks (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="internal_assessment_marks"
                    value={formData.internal_assessment_marks}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assignment Score (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="assignment_scores"
                    value={formData.assignment_scores}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Study Hours / Day (0-24)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="study_hours_per_day"
                    value={formData.study_hours_per_day}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Completed Assignments</label>
                  <input
                    type="number"
                    name="completed_assignments"
                    value={formData.completed_assignments}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

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
              <span>{isEdit ? 'Save Changes' : 'Register Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
