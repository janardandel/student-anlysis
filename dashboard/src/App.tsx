import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentTable } from './components/StudentTable';
import { StudentPlanning } from './components/StudentPlanning';
import { StudentDetailModal } from './components/StudentDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { getSupabase } from './lib/supabase';
import { mockInstitutes, mockCourses, mockStudents, mockQuizzes, mockAttempts, mockPlans } from './lib/mockData';
import { Institute, Course, Student, Quiz, QuizAttempt, StudentPlan } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'planning'>('overview');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Multi-Tenant & Role Hierarchy States
  const [institutes, setInstitutes] = useState<Institute[]>(mockInstitutes);
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'owner' | 'teacher'>('owner');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Application Data States
  const [allCourses, setAllCourses] = useState<Course[]>(mockCourses);
  const [allStudents, setAllStudents] = useState<Student[]>(mockStudents);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>(mockAttempts);
  const [allPlans, setAllPlans] = useState<StudentPlan[]>(mockPlans);

  // Load Data function from Supabase
  const loadData = async () => {
    setIsRefreshing(true);
    const supabase = getSupabase();

    if (!supabase) {
      setIsLiveMode(false);
      setInstitutes(mockInstitutes);
      setAllCourses(mockCourses);
      setAllStudents(mockStudents);
      setAllQuizzes(mockQuizzes);
      setAllAttempts(mockAttempts);
      setAllPlans(mockPlans);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLiveMode(true);
      const [instRes, coursesRes, studentsRes, quizzesRes, attemptsRes, plansRes] = await Promise.all([
        supabase.from('institutes').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('students').select('*'),
        supabase.from('quizzes').select('*'),
        supabase.from('quiz_attempts').select('*').order('submitted_at', { ascending: false }),
        supabase.from('student_plans').select('*'),
      ]);

      if (instRes.data && instRes.data.length > 0) setInstitutes(instRes.data);
      if (coursesRes.data && coursesRes.data.length > 0) setAllCourses(coursesRes.data);
      if (studentsRes.data && studentsRes.data.length > 0) setAllStudents(studentsRes.data);
      if (quizzesRes.data && quizzesRes.data.length > 0) setAllQuizzes(quizzesRes.data);
      if (attemptsRes.data && attemptsRes.data.length > 0) setAllAttempts(attemptsRes.data);
      if (plansRes.data && plansRes.data.length > 0) setAllPlans(plansRes.data);
    } catch (err) {
      console.error('Error fetching live data from Supabase', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter dataset by Selected Institute
  const instituteStudents = allStudents.filter(
    (s) => selectedInstituteId === 'all' || s.institute_id === selectedInstituteId
  );
  const instituteStudentIds = new Set(instituteStudents.map((s) => s.id));

  const instituteCourses = allCourses.filter(
    (c) => selectedInstituteId === 'all' || c.institute_id === selectedInstituteId
  );
  const instituteQuizzes = allQuizzes.filter(
    (q) => selectedInstituteId === 'all' || q.institute_id === selectedInstituteId
  );
  const instituteAttempts = allAttempts.filter(
    (a) => selectedInstituteId === 'all' || a.institute_id === selectedInstituteId || instituteStudentIds.has(a.student_id)
  );
  const institutePlans = allPlans.filter(
    (p) => selectedInstituteId === 'all' || p.institute_id === selectedInstituteId || instituteStudentIds.has(p.student_id)
  );

  // Extract classes available in this institute
  const availableClasses = Array.from(
    new Set(instituteStudents.map((s) => s.class_name).filter(Boolean))
  ) as string[];

  // Further filter by Selected Class if in Teacher Mode
  const activeStudents = instituteStudents.filter(
    (s) => viewMode === 'owner' || selectedClass === 'all' || s.class_name === selectedClass
  );
  const activeStudentIds = new Set(activeStudents.map((s) => s.id));

  const activeAttempts = instituteAttempts.filter(
    (a) => viewMode === 'owner' || selectedClass === 'all' || activeStudentIds.has(a.student_id) || a.class_name === selectedClass
  );
  const activeQuizzes = instituteQuizzes.filter(
    (q) => viewMode === 'owner' || selectedClass === 'all' || q.class_name === selectedClass
  );
  const activePlans = institutePlans.filter(
    (p) => viewMode === 'owner' || selectedClass === 'all' || activeStudentIds.has(p.student_id)
  );

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
    setAllPlans((prev) => {
      const existingIndex = prev.findIndex((p) => p.student_id === planData.student_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...planData } as StudentPlan;
        return updated;
      } else {
        const newPlan: StudentPlan = {
          id: `p_${Date.now()}`,
          institute_id: planData.institute_id,
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

  const selectedStudent = allStudents.find((s) => s.id === selectedStudentId) || null;
  const selectedStudentPlan = allPlans.find((p) => p.student_id === selectedStudentId);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F0F0F0] flex flex-col selection:bg-[#F40009] selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        institutes={institutes}
        selectedInstituteId={selectedInstituteId}
        onSelectInstitute={(id) => {
          setSelectedInstituteId(id);
          setSelectedClass('all');
        }}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        classes={availableClasses}
        selectedClass={selectedClass}
        onSelectClass={(cls) => setSelectedClass(cls)}
        isLiveMode={isLiveMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Demo Mode Notice Banner */}
      {!isLiveMode && (
        <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 py-2 text-xs text-[#A0A0A0] flex items-center justify-between">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-[#F40009] flex-shrink-0" />
            <span>
              <strong className="text-[#F0F0F0]">Preview Mode:</strong> Displaying sample multi-coaching test submissions.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            institutes={institutes}
            selectedInstituteId={selectedInstituteId}
            viewMode={viewMode}
            selectedClass={selectedClass}
            students={activeStudents}
            attempts={activeAttempts}
            courses={instituteCourses}
            quizzes={activeQuizzes}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onSelectClass={(cls) => {
              setSelectedClass(cls);
              setViewMode('teacher');
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentTable
            students={activeStudents}
            attempts={activeAttempts}
            quizzes={activeQuizzes}
            courses={instituteCourses}
            classes={availableClasses}
            selectedClass={selectedClass}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'planning' && (
          <StudentPlanning
            students={activeStudents}
            plans={activePlans}
            attempts={activeAttempts}
            selectedClass={selectedClass}
            onSavePlan={handleSavePlan}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}
      </main>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        attempts={allAttempts}
        quizzes={allQuizzes}
        plan={selectedStudentPlan}
        onClose={() => setSelectedStudentId(null)}
        onOpenPlanning={() => {
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
