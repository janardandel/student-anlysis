-- ==============================================================================
-- Sample Seed Data for Testing Moodle Reporting Dashboard
-- ==============================================================================

-- 1. Insert Courses
INSERT INTO courses (id, moodle_course_id, course_name, short_name) VALUES
('11111111-1111-1111-1111-111111111111', 101, 'Introduction to Computer Science', 'CS101'),
('22222222-2222-2222-2222-222222222222', 102, 'Data Structures & Algorithms', 'CS201')
ON CONFLICT (moodle_course_id) DO NOTHING;

-- 2. Insert Students
INSERT INTO students (id, moodle_user_id, email, full_name, department) VALUES
('33333333-3333-3333-3333-333333333331', 201, 'alex.smith@university.edu', 'Alex Smith', 'Computer Science'),
('33333333-3333-3333-3333-333333333332', 202, 'maria.garcia@university.edu', 'Maria Garcia', 'Computer Science'),
('33333333-3333-3333-3333-333333333333', 203, 'sam.wilson@university.edu', 'Sam Wilson', 'Software Engineering'),
('33333333-3333-3333-3333-333333333334', 204, 'elena.rostova@university.edu', 'Elena Rostova', 'Data Science'),
('33333333-3333-3333-3333-333333333335', 205, 'david.chen@university.edu', 'David Chen', 'Information Tech')
ON CONFLICT (moodle_user_id) DO NOTHING;

-- 3. Insert Quizzes
INSERT INTO quizzes (id, moodle_quiz_id, course_id, quiz_name, max_score, passing_score) VALUES
('44444444-4444-4444-4444-444444444441', 301, '11111111-1111-1111-1111-111111111111', 'Module 1: Variables & Control Flow', 100, 60),
('44444444-4444-4444-4444-444444444442', 302, '11111111-1111-1111-1111-111111111111', 'Module 2: Functions & Recursion', 100, 60),
('44444444-4444-4444-4444-444444444443', 303, '22222222-2222-2222-2222-222222222222', 'Midterm Assessment: Trees & Graphs', 100, 50)
ON CONFLICT (moodle_quiz_id) DO NOTHING;

-- 4. Insert Quiz Attempts
INSERT INTO quiz_attempts (moodle_attempt_id, student_id, quiz_id, attempt_number, score_obtained, max_score, percentage, status, time_taken_seconds, submitted_at) VALUES
(4001, '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 1, 88, 100, 88.0, 'passed', 1420, now() - INTERVAL '4 days'),
(4002, '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444441', 1, 95, 100, 95.0, 'passed', 1100, now() - INTERVAL '4 days'),
(4003, '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444441', 1, 42, 100, 42.0, 'failed', 2100, now() - INTERVAL '3 days'),
(4004, '33333333-3333-3333-3333-333333333334', '44444444-4444-4444-4444-444444444441', 1, 74, 100, 74.0, 'passed', 1650, now() - INTERVAL '3 days'),
(4005, '33333333-3333-3333-3333-333333333335', '44444444-4444-4444-4444-444444444441', 1, 52, 100, 52.0, 'failed', 1890, now() - INTERVAL '2 days'),

-- Quiz 2
(4006, '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444442', 1, 82, 100, 82.0, 'passed', 1510, now() - INTERVAL '1 day'),
(4007, '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444442', 1, 98, 100, 98.0, 'passed', 980, now() - INTERVAL '1 day'),
(4008, '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444442', 1, 38, 100, 38.0, 'failed', 2300, now() - INTERVAL '12 hours'),
(4009, '33333333-3333-3333-3333-333333333334', '44444444-4444-4444-4444-444444444442', 1, 80, 100, 80.0, 'passed', 1400, now() - INTERVAL '8 hours'),
(4010, '33333333-3333-3333-3333-333333333335', '44444444-4444-4444-4444-444444444442', 1, 64, 100, 64.0, 'passed', 1700, now() - INTERVAL '4 hours')
ON CONFLICT (moodle_attempt_id) DO NOTHING;

-- 5. Insert Student Plans
INSERT INTO student_plans (student_id, risk_level, status, target_goal, action_plan, notes) VALUES
('33333333-3333-3333-3333-333333333333', 'high', 'active', 'Reach 65% in Quiz 3 (Data Structures)', 'Schedule 1-on-1 tutoring on recursion & control flow logic. Assign 3 practice exercises before Quiz 3.', 'Struggled with multi-branch recursion conditions in Quiz 2.'),
('33333333-3333-3333-3333-333333333335', 'medium', 'in_progress', 'Improve score to >75%', 'Provide supplementary video lectures on loop invariants.', 'Showed progress from Quiz 1 (52%) to Quiz 2 (64%).'),
('33333333-3333-3333-3333-333333333332', 'excelling', 'monitoring', 'Advanced project challenge', 'Offer peer-mentoring role or advanced bonus algorithms challenge.', 'Consistently top performer (>95%).');
