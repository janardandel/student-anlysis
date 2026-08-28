import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentTable } from './components/StudentTable';
import { StudentPlanning } from './components/StudentPlanning';
import { StudentDetailModal } from './components/StudentDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { getSupabase } from './lib/supabase';
import { mockCourses, mockStudents, mockQuizzes, mockAttempts, mockPlans } from './lib/mockData';
import { Course, Student, Quiz, QuizAttempt, StudentPlan } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'planning'>('overview');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Application Data States
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(mockAttempts);
  const [plans, setPlans] = useState<StudentPlan[]>(mockPlans);

  // Load Data function (from Supabase if configured, otherwise mock)
  const loadData = async () => {
    setIsRefreshing(true);
    const supabase = getSupabase();

    if (!supabase) {
      // Use Mock Data
      setIsLiveMode(false);
      setCourses(mockCourses);
      setStudents(mockStudents);
      setQuizzes(mockQuizzes);
      setAttempts(mockAttempts);
      setPlans(mockPlans);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLiveMode(true);
      // Fetch from Supabase
      const [coursesRes, studentsRes, quizzesRes, attemptsRes, plansRes] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('students').select('*'),
        supabase.from('quizzes').select('*'),
        supabase.from('quiz_attempts').select('*').order('submitted_at', { ascending: false }),
        supabase.from('student_plans').select('*'),
      ]);

      if (coursesRes.data && coursesRes.data.length > 0) setCourses(coursesRes.data);
      if (studentsRes.data && studentsRes.data.length > 0) setStudents(studentsRes.data);
      if (quizzesRes.data && quizzesRes.data.length > 0) setQuizzes(quizzesRes.data);
      if (attemptsRes.data && attemptsRes.data.length > 0) setAttempts(attemptsRes.data);
      if (plansRes.data && plansRes.data.length > 0) setPlans(plansRes.data);
    } catch (err) {
      console.error('Error fetching live data from Supabase', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save/Update Student Plan
  const handleSavePlan = async (planData: Partial<StudentPlan>) => {
    const supabase = getSupabase();

    if (supabase && isLiveMode) {
      try {
        if (planData.id) {
          await supabase.from('student_plans').update(planData).eq('id', planData.id);
        } else {
          await supabase.from('student_plans').insert([planData]);
        }
        await loadData();
        return;
      } catch (e) {
        console.error('Error saving plan to Supabase:', e);
      }
    }

    // Local / Mock save
    setPlans((prev) => {
      const existingIndex = prev.findIndex((p) => p.student_id === planData.student_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...planData } as StudentPlan;
        return updated;
      } else {
        const newPlan: StudentPlan = {
          id: `p_${Date.now()}`,
          student_id: planData.student_id!,
          risk_level: planData.risk_level || 'medium',
          status: planData.status || 'active',
          target_goal: planData.target_goal,
          action_plan: planData.action_plan,
          notes: planData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [newPlan, ...prev];
      }
    });
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;
  const selectedStudentPlan = plans.find((p) => p.student_id === selectedStudentId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLiveMode={isLiveMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Demo Mode Notice Banner */}
      {!isLiveMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Preview Mode:</strong> Currently displaying sample Moodle test submissions. Connect your Supabase instance anytime in Settings.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            students={students}
            attempts={attempts}
            courses={courses}
            quizzes={quizzes}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'students' && (
          <StudentTable
            students={students}
            attempts={attempts}
            quizzes={quizzes}
            courses={courses}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'planning' && (
          <StudentPlanning
            students={students}
            plans={plans}
            attempts={attempts}
            onSavePlan={handleSavePlan}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}
      </main>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        attempts={attempts}
        quizzes={quizzes}
        plan={selectedStudentPlan}
        onClose={() => setSelectedStudentId(null)}
        onOpenPlanning={(id) => {
          setSelectedStudentId(null);
          setActiveTab('planning');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onCredentialsUpdated={loadData}
      />
    </div>
  );
}

export default App;
