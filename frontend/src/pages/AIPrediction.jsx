import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  UserCheck, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import PredictionResultCard from '../components/PredictionResultCard';

export default function AIPrediction() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Interactive Prediction Parameters
  const [formData, setFormData] = useState({
    student_id: '',
    attendance_percentage: 78.0,
    previous_semester_marks: 70.0,
    internal_assessment_marks: 72.0,
    assignment_scores: 75.0,
    study_hours_per_day: 4.0,
    completed_assignments: 8,
    total_assignments: 10,
    previous_examination_results: 68.0
  });

  const [prediction, setPrediction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load student list for quick dropdown selection
    api.getStudents()
      .then(res => setStudents(res.students || []))
      .catch(err => console.error(err));

    // Load model metrics
    api.getModelMetrics()
      .then(res => setModelMetrics(res))
      .catch(err => console.error(err));

    // Run initial prediction on default values
    handlePredict();
  }, []);

  const handleStudentSelect = (e) => {
    const sid = e.target.value;
    setSelectedStudentId(sid);
    if (!sid) return;

    const stu = students.find(s => s.student_id === sid);
    if (stu) {
      setFormData({
        student_id: stu.student_id,
        attendance_percentage: Number(stu.attendance_percentage || 75.0),
        previous_semester_marks: Number(stu.previous_semester_marks || 68.0),
        internal_assessment_marks: Number(stu.internal_assessment_marks || 70.0),
        assignment_scores: Number(stu.assignment_scores || 72.0),
        study_hours_per_day: Number(stu.study_hours_per_day || 3.5),
        completed_assignments: Number(stu.completed_assignments || 8),
        total_assignments: Number(stu.total_assignments || 10),
        previous_examination_results: Number(stu.previous_semester_marks || 68.0)
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.predictPerformance(formData);
      if (res.success && res.prediction) {
        setPrediction(res.prediction);
      } else {
        throw new Error('Prediction API returned an invalid response.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate prediction. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentObj = students.find(s => s.student_id === formData.student_id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Machine Learning Inference Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI-Based Student Performance Prediction
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time inference using trained Random Forest Classifier and Linear Regression models.
          </p>
        </div>

        {/* Model Accuracy Summary Pill */}
        {modelMetrics && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Classification Accuracy</span>
              <strong className="text-emerald-600 font-bold">
                {Math.round((modelMetrics.metrics?.classification?.Accuracy || 0.788) * 100)}%
              </strong>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Regression Fit (R²)</span>
              <strong className="text-blue-600 font-bold">
                {modelMetrics.metrics?.regression?.R2_Score || 0.931}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Input Panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Predictive Feature Inputs</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  student_id: '',
                  attendance_percentage: 75.0,
                  previous_semester_marks: 68.0,
                  internal_assessment_marks: 70.0,
                  assignment_scores: 72.0,
                  study_hours_per_day: 3.5,
                  completed_assignments: 8,
                  total_assignments: 10,
                  previous_examination_results: 68.0
                });
                setSelectedStudentId('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Student Auto-Fill Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Auto-Fill from Registered Student</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={handleStudentSelect}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="">-- Choose student or use manual sliders below --</option>
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_name} ({s.student_id}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* 1. Attendance Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Attendance Percentage</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {formData.attendance_percentage}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                name="attendance_percentage"
                value={formData.attendance_percentage}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Critical (&lt;60%)</span>
                <span>Warning (75%)</span>
                <span>Excellent (90%+)</span>
              </div>
            </div>

            {/* 2. Previous Semester Marks Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Previous Semester Marks</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.previous_semester_marks}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                name="previous_semester_marks"
                value={formData.previous_semester_marks}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Internal Assessment Marks Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Internal Assessment Marks</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.internal_assessment_marks}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                name="internal_assessment_marks"
                value={formData.internal_assessment_marks}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4. Assignment Scores Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Average Assignment Score</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.assignment_scores}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                name="assignment_scores"
                value={formData.assignment_scores}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 5. Study Hours per Day Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Daily Study Hours</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.study_hours_per_day} hrs/day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                name="study_hours_per_day"
                value={formData.study_hours_per_day}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.5h</span>
                <span>4.0h</span>
                <span>12.0h</span>
              </div>
            </div>

            {/* 6. Completed Assignments */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Completed Assignments (out of 10)</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formData.completed_assignments} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                name="completed_assignments"
                value={formData.completed_assignments}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Predict Student Performance</span>
            </button>
          </form>
        </div>

        {/* Right: Rich Prediction Result Card */}
        <div className="lg:col-span-7">
          {prediction ? (
            <PredictionResultCard
              prediction={prediction}
              studentName={selectedStudentObj?.student_name}
            />
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center text-slate-400">
              <BrainCircuit className="w-12 h-12 mx-auto text-slate-300 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700">Awaiting ML Execution</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Adjust features on the left or select a student, then click "Predict Student Performance" to run the Scikit-learn models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
