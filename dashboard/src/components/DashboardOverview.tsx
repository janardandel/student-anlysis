import React from 'react';
import { Users, CheckCircle2, AlertTriangle, Award, Clock } from 'lucide-react';
import { QuizAttempt, Student, Course, Quiz } from '../types';
import { AnalyticsCharts } from './AnalyticsCharts';

interface DashboardOverviewProps {
  students: Student[];
  attempts: QuizAttempt[];
  courses: Course[];
  quizzes: Quiz[];
  onSelectStudent: (studentId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  attempts,
  quizzes,
  onSelectStudent,
}) => {
  // Compute Key Performance Indicators (KPIs)
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

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students Tested */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Students Active</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {uniqueStudentsTested} <span className="text-xs font-normal text-slate-400">/ {students.length} Total</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-emerald-600 font-medium mr-1">100%</span> participation across {quizzes.length} quizzes
          </div>
        </div>

        {/* Class Average Score */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Average</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {averageScore}%
              </h3>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className={`font-medium mr-1 ${averageScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {averageScore >= 70 ? 'Satisfactory' : 'Needs Attention'}
            </span>
            overall test mean
          </div>
        </div>

        {/* Overall Pass Rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pass Rate</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {passRate}%
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-slate-700 font-medium mr-1">{passedCount} of {totalSubmissions}</span> attempts $\ge$ 60%
          </div>
        </div>

        {/* Students At Risk */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Needs Intervention</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">
                {atRiskCount}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            Students averaging below passing grade threshold
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <AnalyticsCharts attempts={attempts} quizzes={quizzes} students={students} />

      {/* Recent Submissions Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Moodle Submissions</h3>
            <p className="text-xs text-slate-500">Live incoming test results synchronized from Moodle</p>
          </div>
          <span className="text-xs text-indigo-600 font-medium">Auto-syncing via n8n</span>
        </div>

        <div className="divide-y divide-slate-100">
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
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs">
                    {student?.full_name.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 hover:text-indigo-600">
                      {student?.full_name || 'Unknown Student'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {quiz?.quiz_name || 'Quiz Assessment'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-xs text-slate-400 hidden sm:flex">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        attempt.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : attempt.percentage >= 60
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-rose-100 text-rose-800'
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
