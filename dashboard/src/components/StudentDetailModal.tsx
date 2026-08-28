import React from 'react';
import { X, Award } from 'lucide-react';
import { Student, QuizAttempt, Quiz, StudentPlan } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  plan?: StudentPlan;
  onClose: () => void;
  onOpenPlanning: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  attempts,
  quizzes,
  plan,
  onClose,
  onOpenPlanning,
}) => {
  if (!student) return null;

  const studentAttempts = attempts.filter((a) => a.student_id === student.id);
  const totalAttempts = studentAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
      : 0;
  const highestScore =
    totalAttempts > 0 ? Math.max(...studentAttempts.map((a) => a.percentage)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{student.full_name}</h3>
              <p className="text-xs text-slate-500">{student.email} • ID: {student.moodle_user_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Average Score</span>
              <p className="text-xl font-bold text-indigo-600 mt-0.5">{avgScore}%</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Highest Score</span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{highestScore}%</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Quizzes Completed</span>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{totalAttempts}</p>
            </div>
          </div>

          {/* Current Intervention Status */}
          {plan ? (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Active Intervention Plan ({plan.risk_level.toUpperCase()} RISK)</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-200/60 text-indigo-900 capitalize">
                  {plan.status}
                </span>
              </div>
              {plan.target_goal && (
                <p className="text-xs text-slate-700">
                  <strong>Goal:</strong> {plan.target_goal}
                </p>
              )}
              {plan.action_plan && (
                <p className="text-xs text-slate-600">
                  <strong>Action:</strong> {plan.action_plan}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>No custom intervention plan created for this student yet.</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenPlanning(student.id);
                }}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Plan
              </button>
            </div>
          )}

          {/* Attempt History Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Quiz Submissions & Grades
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {studentAttempts.map((attempt) => {
                const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
                const isPassed = attempt.percentage >= 60;

                return (
                  <div key={attempt.id} className="p-3 flex items-center justify-between bg-white">
                    <div>
                      <div className="font-semibold text-slate-900">{quiz?.quiz_name || 'Quiz'}</div>
                      <div className="text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>Attempt #{attempt.attempt_number}</span>
                        <span>•</span>
                        <span>{new Date(attempt.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{attempt.percentage}%</span>
                        <div className="text-slate-400">
                          {attempt.score_obtained}/{attempt.max_score} pts
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
