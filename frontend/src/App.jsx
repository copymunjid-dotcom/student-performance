import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import AcademicPerformance from './pages/AcademicPerformance';
import AIPrediction from './pages/AIPrediction';
import RiskAnalysis from './pages/RiskAnalysis';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/performance" element={<AcademicPerformance />} />
            <Route path="/predict" element={<AIPrediction />} />
            <Route path="/risk-analysis" element={<RiskAnalysis />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
