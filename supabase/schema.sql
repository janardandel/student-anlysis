-- ==============================================================================
-- Moodle to Supabase Reporting Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sync Metadata (Tracks watermark timestamp for incremental n8n sync)
CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    last_synced_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial watermark
INSERT INTO sync_metadata (key, last_synced_at)
VALUES ('moodle_quiz_attempts', '1970-01-01 00:00:00+00')
ON CONFLICT (key) DO NOTHING;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodle_course_id BIGINT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    short_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodle_user_id BIGINT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodle_quiz_id BIGINT UNIQUE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    quiz_name TEXT NOT NULL,
    max_score NUMERIC DEFAULT 100,
    passing_score NUMERIC DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Quiz Attempts Table (Core Reporting Data)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodle_attempt_id BIGINT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    score_obtained NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL DEFAULT 100,
    percentage NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('passed', 'failed', 'in_progress', 'needs_review')),
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMPTZ NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Student Intervention & Planning Table (Teacher Action Tracker)
CREATE TABLE IF NOT EXISTS student_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'excelling')) DEFAULT 'low',
    status TEXT NOT NULL CHECK (status IN ('active', 'in_progress', 'resolved', 'monitoring')) DEFAULT 'monitoring',
    target_goal TEXT,
    action_plan TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_submitted_at ON quiz_attempts(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_plans_student_id ON student_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_plans_risk_level ON student_plans(risk_level);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_plans ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Teachers (Dashboard access)
CREATE POLICY "Teachers can view courses"
    ON courses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can view students"
    ON students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can view quizzes"
    ON quizzes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can view quiz attempts"
    ON quiz_attempts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can view and manage student plans"
    ON student_plans FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
