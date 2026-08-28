export interface Institute {
  id: string;
  name: string;
  code: string;
  city?: string;
  logo_url?: string;
  moodle_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  institute_id?: string;
  moodle_course_id: number;
  course_name: string;
  short_name?: string;
  class_name?: string;
  created_at: string;
}

export interface Student {
  id: string;
  institute_id?: string;
  moodle_user_id: number;
  email: string;
  full_name: string;
  class_name?: string;
  roll_no?: string;
  department?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  institute_id?: string;
  moodle_quiz_id: number;
  course_id: string;
  quiz_name: string;
  class_name?: string;
  max_score: number;
  passing_score: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  institute_id?: string;
  moodle_attempt_id: number;
  student_id: string;
  quiz_id: string;
  class_name?: string;
  attempt_number: number;
  score_obtained: number;
  max_score: number;
  percentage: number;
  status: 'passed' | 'failed' | 'in_progress' | 'needs_review';
  time_taken_seconds?: number;
  submitted_at: string;
  student?: Student;
  quiz?: Quiz;
}

export interface StudentPlan {
  id: string;
  institute_id?: string;
  student_id: string;
  teacher_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'excelling';
  status: 'active' | 'in_progress' | 'resolved' | 'monitoring';
  target_goal?: string;
  action_plan?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
}
