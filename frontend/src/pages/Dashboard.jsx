import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to Flask API. Ensure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Compiling real-time student analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
        <h3 className="font-bold text-sm">Failed to load Dashboard data</h3>
        <p className="text-xs mt-1 text-rose-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, visualizations } = data;
  const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-950/10 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/10 to-transparent pointer-events-none rounded-3xl" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-medium border border-blue-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AI Predictive Intelligence Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            Academic Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed">
            Continuously tracking student trajectories with machine learning. Identify students requiring early intervention and generate personalized academic remediation plans.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => navigate('/predict')}
            className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 shadow-lg shadow-black/10 transition-all flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            <span>Launch AI Predictor</span>
          </button>
          <button
            onClick={() => navigate('/risk-analysis')}
            className="px-4 py-3 rounded-2xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-xs border border-blue-400/30 transition-all"
          >
            View At-Risk Students
          </button>
        </div>
      </div>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total_students}
          subtitle="Enrolled across all depts"
          icon={Users}
          color="blue"
          trend="+12%"
          trendType="positive"
        />
        <StatCard
          title="Avg Academic Score"
          value={`${stats.average_academic_score}%`}
          subtitle="Across previous exams"
          icon={GraduationCap}
          color="emerald"
          trend="+3.4%"
          trendType="positive"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.average_attendance}%`}
          subtitle="Institutional threshold: 75%"
          icon={Clock}
          color="indigo"
          trend="+1.8%"
          trendType="positive"
        />
        <StatCard
          title="Students At Risk"
          value={stats.students_at_risk}
          subtitle="Predicted marks < 50%"
          icon={AlertTriangle}
          color="rose"
          trend={stats.students_at_risk > 0 ? "Requires Action" : "None"}
          trendType="negative"
        />
        <StatCard
          title="Predicted Pass Rate"
          value={`${stats.predicted_pass_percentage}%`}
          subtitle={`Mean: ${stats.average_predicted_marks}%`}
          icon={TrendingUp}
          color="amber"
          trend="RF Model"
          trendType="neutral"
        />
      </div>

      {/* 2. Visualizations Row 1: Overall Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Student Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Overall Student Score Distribution</h3>
              <p className="text-xs text-slate-500">Student counts across performance brackets</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              Live DB Records
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualizations.overall_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                  {visualizations.overall_performance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Category Distribution (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Performance Classification</h3>
            <p className="text-xs text-slate-500">Predicted performance category spread</p>
          </div>

          <div className="h-52 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visualizations.category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {visualizations.category_distribution.map((entry, index) => (
                    <Cell key={`cell-cat-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {visualizations.category_distribution.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                <span className="text-slate-600 truncate">{c.name}:</span>
                <strong className="text-slate-900 ml-auto">{c.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Visualizations Row 2: Subject-Wise Performance & Attendance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject-Wise Performance Averages</h3>
              <p className="text-xs text-slate-500">Average marks scored across foundational curriculum</p>
            </div>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={visualizations.subject_performance} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(val) => [`${val}%`, 'Class Average']}
                />
                <Bar dataKey="average" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Analysis Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Distribution & Thresholds</h3>
              <p className="text-xs text-slate-500">Student counts by mandatory attendance bracket</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualizations.attendance_analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {visualizations.attendance_analysis.map((entry, index) => {
                    const color = entry.status === 'Critical' ? '#EF4444' :
                                  entry.status === 'Warning' ? '#F59E0B' :
                                  entry.status === 'Adequate' ? '#3B82F6' : '#10B981';
                    return <Cell key={`cell-att-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Visualizations Row 3: Semester Trends & Pass vs Fail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester Performance Trends */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Semester Academic Progression Trends</h3>
              <p className="text-xs text-slate-500">Tracking average marks and attendance across semesters</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Marks
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Attendance
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visualizations.semester_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="average_marks" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMarks)" />
                <Area type="monotone" dataKey="attendance" stroke="#818CF8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pass vs Fail Ratio */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pass vs Risk Distribution</h3>
            <p className="text-xs text-slate-500">Predicted examination clearance status</p>
          </div>

          <div className="h-52 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visualizations.pass_fail_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {visualizations.pass_fail_distribution.map((entry, index) => (
                    <Cell key={`cell-pf-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Clearance Rate:</span>
            <strong className="text-blue-600 font-bold">95.0% Institutional Goal</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
