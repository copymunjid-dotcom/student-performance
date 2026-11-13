import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import StudentModal from '../components/StudentModal';
import StudentProfileModal from '../components/StudentProfileModal';
import PerformanceFormModal from '../components/PerformanceFormModal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [academicYear, setAcademicYear] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [perfStudent, setPerfStudent] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [department, academicYear, riskFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search,
        department: department === 'All' ? '' : department,
        academic_year: academicYear === 'All' ? '' : academicYear,
        risk: riskFilter === 'All' ? '' : riskFilter
      });
      setStudents(res.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDelete = async (studentId) => {
    try {
      await api.deleteStudent(studentId);
      setFeedbackMessage(`Student ${studentId} deleted successfully.`);
      setDeleteConfirmId(null);
      fetchStudents();
      setTimeout(() => setFeedbackMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete student.');
    }
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'Excellent':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Excellent</span>;
      case 'Good':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Good</span>;
      case 'Average':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Average</span>;
      case 'At Risk':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">At Risk</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">{category}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Student Directory & Records</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student registrations, academic tracks, and predictive performance statuses.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll no, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics Engineering">Electronics Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-blue-500"
          >
            <option value="All">All Years</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-blue-500"
          >
            <option value="All">All Risk Tiers</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="At Risk">At Risk</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Loading student records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No students found</p>
            <p className="text-slate-400 mt-1">Try clearing filters or search queries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Department & Year</th>
                  <th className="px-4 py-3.5 text-center">Attendance</th>
                  <th className="px-4 py-3.5 text-center">Prev Marks</th>
                  <th className="px-4 py-3.5 text-center">AI Projected</th>
                  <th className="px-4 py-3.5 text-center">AI Category</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {stu.student_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer" onClick={() => setProfileStudentId(stu.student_id)}>
                            {stu.student_name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{stu.student_id} &bull; {stu.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800">{stu.department}</p>
                      <p className="text-[11px] text-slate-400">{stu.academic_year} &bull; Sem {stu.semester}</p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-bold ${
                        (stu.attendance_percentage || 0) < 65 ? 'text-rose-600' :
                        (stu.attendance_percentage || 0) < 75 ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {stu.attendance_percentage ? `${stu.attendance_percentage}%` : '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {stu.previous_semester_marks ? `${stu.previous_semester_marks}%` : '—'}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {stu.predicted_marks ? (
                        <div className="inline-flex items-center gap-1 text-blue-600 font-extrabold text-xs">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{stu.predicted_marks}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {getRiskBadge(stu.performance_category)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Profile */}
                        <button
                          onClick={() => setProfileStudentId(stu.student_id)}
                          title="View Profile Dossier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Update Grades & Metrics */}
                        <button
                          onClick={() => setPerfStudent(stu)}
                          title="Update Academic Performance"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <GraduationCap className="w-4 h-4" />
                        </button>

                        {/* Edit Student Info */}
                        <button
                          onClick={() => {
                            setSelectedStudent(stu);
                            setIsModalOpen(true);
                          }}
                          title="Edit Student Info"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Student */}
                        <button
                          onClick={() => setDeleteConfirmId(stu.student_id)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Student Record?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete student <strong>{deleteConfirmId}</strong>? All associated performance and predictions will be removed.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchStudents}
        student={selectedStudent}
      />

      <StudentProfileModal
        isOpen={Boolean(profileStudentId)}
        onClose={() => setProfileStudentId(null)}
        studentId={profileStudentId}
      />

      <PerformanceFormModal
        isOpen={Boolean(perfStudent)}
        onClose={() => setPerfStudent(null)}
        onSaved={fetchStudents}
        student={perfStudent}
      />
    </div>
  );
}
