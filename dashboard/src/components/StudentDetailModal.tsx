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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161616] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#2A2A2A] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-[#F40009] text-white font-bold flex items-center justify-center text-base shadow-pitthu-red">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0]">{student.full_name}</h3>
              <p className="text-xs text-[#A0A0A0]">{student.email} • ID: {student.moodle_user_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#777777] hover:text-[#F0F0F0] rounded-lg hover:bg-[#242424] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A] text-center">
              <span className="text-xs text-[#A0A0A0] font-semibold">Average Score</span>
              <p className="text-xl font-extrabold text-[#F40009] mt-0.5">{avgScore}%</p>
            </div>
            <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A] text-center">
              <span className="text-xs text-[#A0A0A0] font-semibold">Highest Score</span>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{highestScore}%</p>
            </div>
            <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A] text-center">
              <span className="text-xs text-[#A0A0A0] font-semibold">Tests Completed</span>
              <p className="text-xl font-extrabold text-[#F0F0F0] mt-0.5">{totalAttempts}</p>
            </div>
          </div>

          {/* Current Intervention Status */}
          {plan ? (
            <div className="p-4 rounded-xl border border-[#F40009]/30 bg-[#F40009]/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F40009] flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Active Intervention Plan ({plan.risk_level.toUpperCase()} RISK)</span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F40009]/20 text-[#F40009] border border-[#F40009]/40 capitalize">
                  {plan.status}
                </span>
              </div>
              {plan.target_goal && (
                <p className="text-xs text-[#F0F0F0]">
                  <strong>Goal:</strong> {plan.target_goal}
                </p>
              )}
              {plan.action_plan && (
                <p className="text-xs text-[#A0A0A0]">
                  <strong>Action:</strong> {plan.action_plan}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-[#333333] bg-[#1A1A1A] flex items-center justify-between text-xs text-[#A0A0A0]">
              <span>No custom intervention plan created for this student yet.</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenPlanning(student.id);
                }}
                className="px-3.5 py-1.5 bg-[#F40009] text-white rounded-lg font-bold hover:bg-[#A30006] transition-all shadow-pitthu-red"
              >
                Create Plan
              </button>
            </div>
          )}

          {/* Attempt History Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0] mb-2.5">
              Test Submissions & Scores
            </h4>
            <div className="border border-[#2A2A2A] rounded-xl overflow-hidden divide-y divide-[#2A2A2A] text-xs">
              {studentAttempts.map((attempt) => {
                const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
                const isPassed = attempt.percentage >= 60;

                return (
                  <div key={attempt.id} className="p-3 flex items-center justify-between bg-[#1A1A1A]">
                    <div>
                      <div className="font-bold text-[#F0F0F0]">{quiz?.quiz_name || 'Quiz'}</div>
                      <div className="text-[#777777] mt-0.5 flex items-center space-x-2">
                        <span>Attempt #{attempt.attempt_number}</span>
                        <span>•</span>
                        <span>{new Date(attempt.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="font-extrabold text-[#F0F0F0]">{attempt.percentage}%</span>
                        <div className="text-[#777777]">
                          {attempt.score_obtained}/{attempt.max_score} pts
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                          isPassed
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30'
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
        <div className="px-6 py-3 border-t border-[#2A2A2A] bg-[#1A1A1A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#242424] hover:bg-[#333333] text-[#F0F0F0] font-semibold rounded-xl text-xs transition-colors border border-[#333333]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
