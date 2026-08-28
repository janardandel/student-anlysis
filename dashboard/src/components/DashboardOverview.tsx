import React from 'react';
import { Users, CheckCircle2, AlertTriangle, Award, Clock, Crown, Layers, BookOpen } from 'lucide-react';
import { QuizAttempt, Student, Course, Quiz, Institute } from '../types';
import { AnalyticsCharts } from './AnalyticsCharts';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardOverviewProps {
  institutes: Institute[];
  selectedInstituteId: string;
  viewMode: 'owner' | 'teacher';
  selectedClass: string;
  students: Student[];
  attempts: QuizAttempt[];
  courses: Course[];
  quizzes: Quiz[];
  onSelectStudent: (studentId: string) => void;
  onSelectClass: (className: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  institutes,
  selectedInstituteId,
  viewMode,
  selectedClass,
  students,
  attempts,
  quizzes,
  onSelectStudent,
  onSelectClass,
}) => {
  // Current active institute info
  const activeInstitute = institutes.find((i) => i.id === selectedInstituteId);

  // Compute KPIs for the filtered dataset
  const totalSubmissions = attempts.length;
  const uniqueStudentsTested = new Set(attempts.map((a) => a.student_id)).size;
  
  const averageScore = totalSubmissions > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalSubmissions)
    : 0;

  const passedCount = attempts.filter((a) => a.percentage >= 60).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  const atRiskCount = students.filter((student) => {
    const studentAttempts = attempts.filter((a) => a.student_id === student.id);
    if (studentAttempts.length === 0) return false;
    const avg = studentAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / studentAttempts.length;
    return avg < 55;
  }).length;

  // Extract distinct classes in this dataset
  const classNames = Array.from(new Set(students.map((s) => s.class_name || 'General Batch'))).filter(Boolean);

  // Calculate Cross-Class Comparison metrics for Institute Owner View
  const classComparisonData = classNames.map((className) => {
    const classStudents = students.filter((s) => (s.class_name || 'General Batch') === className);
    const studentIds = new Set(classStudents.map((s) => s.id));
    const classAttempts = attempts.filter((a) => studentIds.has(a.student_id));
    const avg = classAttempts.length > 0
      ? Math.round(classAttempts.reduce((sum, a) => sum + a.percentage, 0) / classAttempts.length)
      : 0;
    const passed = classAttempts.filter((a) => a.percentage >= 60).length;
    const passPct = classAttempts.length > 0 ? Math.round((passed / classAttempts.length) * 100) : 0;

    return {
      name: className.length > 18 ? className.substring(0, 16) + '...' : className,
      fullName: className,
      average: avg,
      passRate: passPct,
      studentCount: classStudents.length,
      attemptsCount: classAttempts.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30">
            {viewMode === 'owner' ? <Crown className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F0F0F0] flex items-center gap-2">
              <span>{activeInstitute ? activeInstitute.name : 'All Coaching Institutes'}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#242424] text-[#A0A0A0] border border-[#333333]">
                {viewMode === 'owner' ? '👑 Owner Dashboard (All Classes)' : `👨‍🏫 Teacher Mode (${selectedClass === 'all' ? 'All Classes' : selectedClass})`}
              </span>
            </h2>
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              {viewMode === 'owner'
                ? 'Birds-eye aggregated reporting across all batches, student batches, and teachers.'
                : 'Class-level performance tracking, test attempts, and student intervention planning.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#A0A0A0]">
          <span className="px-2.5 py-1 rounded-lg bg-[#242424] border border-[#333333] font-semibold text-[#F0F0F0]">
            {classNames.length} Active Classes / Batches
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students Tested */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl hover:border-[#333333] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">Students Tested</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F0] mt-1">
                {uniqueStudentsTested} <span className="text-xs font-normal text-[#777777]">/ {students.length} Enrolled</span>
              </h3>
            </div>
            <div className="p-3 bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-[#A0A0A0]">
            <span className="text-emerald-400 font-semibold mr-1">
              {students.length > 0 ? Math.round((uniqueStudentsTested / students.length) * 100) : 0}%
            </span>{' '}
            participation rate
          </div>
        </div>

        {/* Class Average Score */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl hover:border-[#333333] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">
                {viewMode === 'owner' ? 'Institute Average' : 'Class Average'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F0] mt-1">
                {averageScore}%
              </h3>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-[#A0A0A0]">
            <span className={`font-semibold mr-1 ${averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {averageScore >= 70 ? 'Satisfactory' : 'Needs Attention'}
            </span>
            mean score across tests
          </div>
        </div>

        {/* Overall Pass Rate */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl hover:border-[#333333] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">Overall Pass Rate</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F0] mt-1">
                {passRate}%
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-[#A0A0A0]">
            <span className="text-[#F0F0F0] font-semibold mr-1">{passedCount} of {totalSubmissions}</span> attempts $\ge$ 60%
          </div>
        </div>

        {/* Students At Risk */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl hover:border-[#F40009]/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0]">Needs Remediation</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F40009] mt-1">
                {atRiskCount}
              </h3>
            </div>
            <div className="p-3 bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-[#A0A0A0]">
            Students averaging &lt;55% in tests
          </div>
        </div>
      </div>

      {/* OWNER EXCLUSIVE: Cross-Class Performance Matrix */}
      {viewMode === 'owner' && classComparisonData.length > 1 && (
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#2A2A2A]">
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F40009]" />
                <span>Class-by-Class Comparative Analytics</span>
              </h3>
              <p className="text-xs text-[#A0A0A0]">Compare student mastery across different coaching batches</p>
            </div>
            <span className="text-xs text-[#A0A0A0]">Click a class to filter</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <XAxis dataKey="name" tick={{ fill: '#A0A0A0', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#A0A0A0', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E1E1E',
                      borderRadius: '12px',
                      border: '1px solid #333333',
                      color: '#F0F0F0',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Average Score']}
                  />
                  <Bar dataKey="average" fill="#F40009" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Class Cards */}
            <div className="space-y-2.5">
              {classComparisonData.map((cls) => (
                <div
                  key={cls.fullName}
                  onClick={() => onSelectClass(cls.fullName)}
                  className="p-3.5 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#F40009]/50 hover:bg-[#1F1F1F] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#F0F0F0]">{cls.fullName}</h4>
                    <p className="text-[11px] text-[#777777]">{cls.studentCount} Students • {cls.attemptsCount} Submissions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#F0F0F0]">{cls.average}%</span>
                    <p className="text-[10px] text-emerald-400">{cls.passRate}% Pass</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Section */}
      <AnalyticsCharts attempts={attempts} quizzes={quizzes} students={students} />

      {/* Recent Submissions Feed */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A2A2A]">
          <div>
            <h3 className="text-base font-bold text-[#F0F0F0]">Recent Test Submissions</h3>
            <p className="text-xs text-[#A0A0A0]">Real-time test results synchronized from Moodle</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30">
            Auto-syncing via n8n
          </span>
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {attempts.slice(0, 5).map((attempt) => {
            const student = students.find((s) => s.id === attempt.student_id);
            const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
            const dateFormatted = new Date(attempt.submitted_at).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={attempt.id}
                onClick={() => onSelectStudent(attempt.student_id)}
                className="py-3.5 flex items-center justify-between hover:bg-[#242424] px-3 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#242424] border border-[#333333] text-[#F40009] font-bold flex items-center justify-center text-xs">
                    {student?.full_name.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-[#F0F0F0] hover:text-[#F40009] transition-colors">
                        {student?.full_name || 'Unknown Student'}
                      </h4>
                      {student?.class_name && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#242424] text-[#A0A0A0] border border-[#333333]">
                          {student.class_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A0A0A0]">
                      {quiz?.quiz_name || 'Quiz Assessment'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-xs text-[#777777] hidden sm:flex">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        attempt.percentage >= 80
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : attempt.percentage >= 60
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30'
                      }`}
                    >
                      {attempt.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
