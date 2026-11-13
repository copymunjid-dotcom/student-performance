-- ==============================================================================
-- Student Performance Prediction Dashboard Using AI
-- Supabase / PostgreSQL Schema Definition
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Extends Supabase auth.users or standalone teacher/admin profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'counselor')),
    department VARCHAR(100) DEFAULT 'Computer Science',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    phone VARCHAR(30),
    enrollment_status VARCHAR(50) DEFAULT 'Active' CHECK (enrollment_status IN ('Active', 'On Leave', 'Graduated', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS public.performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    attendance_percentage NUMERIC(5, 2) NOT NULL CHECK (attendance_percentage BETWEEN 0 AND 100),
    previous_semester_marks NUMERIC(5, 2) NOT NULL CHECK (previous_semester_marks BETWEEN 0 AND 100),
    internal_assessment_marks NUMERIC(5, 2) NOT NULL CHECK (internal_assessment_marks BETWEEN 0 AND 100),
    assignment_scores NUMERIC(5, 2) NOT NULL CHECK (assignment_scores BETWEEN 0 AND 100),
    study_hours_per_day NUMERIC(4, 2) NOT NULL CHECK (study_hours_per_day BETWEEN 0 AND 24),
    completed_assignments INT NOT NULL CHECK (completed_assignments >= 0),
    total_assignments INT DEFAULT 10 CHECK (total_assignments > 0),
    subject_marks JSONB DEFAULT '{}'::jsonb, -- e.g. {"Mathematics": 78, "Programming": 85, "DBMS": 72}
    recorded_semester INT NOT NULL CHECK (recorded_semester BETWEEN 1 AND 8),
    academic_term VARCHAR(50) DEFAULT 'Fall 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PREDICTIONS TABLE (AI ML Model Outputs)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    predicted_marks NUMERIC(5, 2) NOT NULL CHECK (predicted_marks BETWEEN 0 AND 100),
    performance_category VARCHAR(50) NOT NULL CHECK (performance_category IN ('Excellent', 'Good', 'Average', 'At Risk')),
    confidence_score NUMERIC(5, 2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    probabilities JSONB DEFAULT '{}'::jsonb, -- Category probability distribution
    influencing_factors JSONB DEFAULT '[]'::jsonb, -- Key factor impacts
    model_version VARCHAR(50) DEFAULT 'RF-LR-v1.0',
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RECOMMENDATIONS TABLE (Personalized AI Advice & Interventions)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- 'Attendance', 'Academics', 'Assignments', 'Study Routine', 'Mentorship'
    recommendation_text TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low', 'Critical')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(department);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON public.students(academic_year);
CREATE INDEX IF NOT EXISTS idx_performance_student_id ON public.performance(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_student_id ON public.predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON public.predictions(performance_category);
CREATE INDEX IF NOT EXISTS idx_recommendations_student_id ON public.recommendations(student_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (teachers and administrators) full read/write access
CREATE POLICY "Authenticated users can select students"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert students"
    ON public.students FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
    ON public.students FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete students"
    ON public.students FOR DELETE
    TO authenticated
    USING (true);

-- Similar policies for performance, predictions, and recommendations
CREATE POLICY "Authenticated users can select performance"
    ON public.performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert performance"
    ON public.performance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update performance"
    ON public.performance FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select predictions"
    ON public.predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert predictions"
    ON public.predictions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can select recommendations"
    ON public.recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert recommendations"
    ON public.recommendations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update recommendations"
    ON public.recommendations FOR UPDATE TO authenticated USING (true);
