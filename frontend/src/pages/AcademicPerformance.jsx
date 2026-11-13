import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import PerformanceFormModal from '../components/PerformanceFormModal';
import StudentProfileModal from '../components/StudentProfileModal';

export default function AcademicPerformance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);

  useEffect(() => {
    loadData();
  }, [department]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search,
        department: department === 'All' ? '' : department
      });
      setStudents(res.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Academic Performance Records</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor attendance, internal grades, assignment rates, and trigger ML prediction updates.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
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

        <div className="flex items-center gap-2 text-xs">
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
      </div>

      {/* Performance Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold">Loading academic performance records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5 text-center">Attendance %</th>
                  <th className="px-4 py-3.5 text-center">Prev Sem</th>
                  <th className="px-4 py-3.5 text-center">Internal Marks</th>
                  <th className="px-4 py-3.5 text-center">Assignments</th>
                  <th className="px-4 py-3.5 text-center">Study Hours</th>
                  <th className="px-4 py-3.5 text-center">Completion</th>
                  <th className="px-4 py-3.5 text-center">Predicted</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => {
                  const compRate = stu.total_assignments 
                    ? Math.round((stu.completed_assignments / stu.total_assignments) * 100) 
                    : 80;

                  return (
                    <tr key={stu.student_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
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
                        <span className={`inline-block font-bold px-2 py-0.5 rounded-md ${
                          stu.attendance_percentage < 65 ? 'bg-rose-50 text-rose-700' :
                          stu.attendance_percentage < 75 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {stu.attendance_percentage}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {stu.previous_semester_marks}%
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {stu.internal_assessment_marks}%
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                        {stu.assignment_scores}%
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-slate-700">{stu.study_hours_per_day}h</span>
                        <span className="text-[10px] text-slate-400">/day</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-700">{stu.completed_assignments}/{stu.total_assignments} ({compRate}%)</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1">
                            <div 
                              className={`h-full rounded-full ${compRate < 60 ? 'bg-rose-500' : compRate < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${compRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-blue-600 font-extrabold text-xs">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{stu.predicted_marks}%</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedStudent(stu)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update</span>
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

      <PerformanceFormModal
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        onSaved={loadData}
        student={selectedStudent}
      />

      <StudentProfileModal
        isOpen={Boolean(profileStudentId)}
        onClose={() => setProfileStudentId(null)}
        studentId={profileStudentId}
      />
    </div>
  );
}
