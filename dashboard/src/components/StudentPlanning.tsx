import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle, Sparkles, Flame } from 'lucide-react';
import { Student, StudentPlan, QuizAttempt } from '../types';

interface StudentPlanningProps {
  students: Student[];
  plans: StudentPlan[];
  attempts: QuizAttempt[];
  onSavePlan: (plan: Partial<StudentPlan>) => void;
  onSelectStudent: (studentId: string) => void;
}

export const StudentPlanning: React.FC<StudentPlanningProps> = ({
  students,
  plans,
  attempts,
  onSavePlan,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'excelling'>('medium');
  const [status, setStatus] = useState<'active' | 'in_progress' | 'resolved' | 'monitoring'>('active');
  const [targetGoal, setTargetGoal] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When switching student in form, load their existing plan if available
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const existing = plans.find((p) => p.student_id === id);
    if (existing) {
      setRiskLevel(existing.risk_level);
      setStatus(existing.status);
      setTargetGoal(existing.target_goal || '');
      setActionPlan(existing.action_plan || '');
      setNotes(existing.notes || '');
    } else {
      // Defaults based on score
      const studentAttempts = attempts.filter((a) => a.student_id === id);
      const avg =
        studentAttempts.length > 0
          ? studentAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / studentAttempts.length
          : 70;
      setRiskLevel(avg < 50 ? 'high' : avg < 70 ? 'medium' : avg >= 90 ? 'excelling' : 'low');
      setStatus('active');
      setTargetGoal('');
      setActionPlan('');
      setNotes('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const existing = plans.find((p) => p.student_id === selectedStudentId);

    onSavePlan({
      id: existing?.id,
      student_id: selectedStudentId,
      risk_level: riskLevel,
      status: status,
      target_goal: targetGoal,
      action_plan: actionPlan,
      notes: notes,
      updated_at: new Date().toISOString(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Group plans by status
  const activePlans = plans.filter((p) => p.status === 'active' || p.status === 'in_progress');
  const resolvedPlans = plans.filter((p) => p.status === 'resolved' || p.status === 'monitoring');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#A30006] via-[#F40009] to-[#A30006] rounded-2xl p-6 text-white shadow-pitthu-red border border-[#F40009]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-white" />
              <h2 className="text-xl font-black tracking-tight">Student Planning & Intervention System</h2>
            </div>
            <p className="text-sm text-red-100 mt-1">
              Create individualized remediation strategies, assign milestone goals, and record coaching notes.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-xs text-red-100 font-semibold">Active Action Plans:</span>
            <span className="text-xl font-extrabold text-white">{activePlans.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Form */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl lg:col-span-1">
          <h3 className="text-base font-bold text-[#F0F0F0] mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F40009]" />
            <span>Create / Update Student Plan</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Select Student */}
            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.department || 'Student'})
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Tier & Plan Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:border-[#F40009]"
                >
                  <option value="high">High Risk (&lt;50%)</option>
                  <option value="medium">Medium Risk (50-69%)</option>
                  <option value="low">Low Risk / On-Track</option>
                  <option value="excelling">Excelling (&gt;90%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                  Plan Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:border-[#F40009]"
                >
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Target Objective / Milestone
              </label>
              <input
                type="text"
                placeholder="e.g. Achieve >70% on Quiz 3 Recursion module"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>

            {/* Action Plan */}
            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Remedial / Action Steps
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Schedule 1-on-1 tutoring session. Assign 3 extra practice questions on Moodle."
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>

            {/* Teacher Notes */}
            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Observation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Private observation notes for teacher review..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#F40009] hover:bg-[#A30006] text-white font-bold rounded-xl shadow-pitthu-red transition-all text-sm flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save Action Plan</span>
            </button>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Student plan saved successfully!</span>
              </div>
            )}
          </form>
        </div>

        {/* Existing Plans List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl">
            <h3 className="text-base font-bold text-[#F0F0F0] mb-4">
              Active Intervention Tracker ({activePlans.length})
            </h3>

            {activePlans.length === 0 ? (
              <p className="text-sm text-[#777777] py-6 text-center">No active student plans yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePlans.map((plan) => {
                  const student = students.find((s) => s.id === plan.student_id);
                  const studentAttempts = attempts.filter((a) => a.student_id === plan.student_id);
                  const avg =
                    studentAttempts.length > 0
                      ? Math.round(
                          studentAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                            studentAttempts.length
                        )
                      : 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleStudentChange(plan.student_id)}
                      className="p-4 rounded-xl border border-[#2A2A2A] bg-[#161616] hover:border-[#F40009]/50 hover:shadow-pitthu-red transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#F0F0F0] text-sm">
                            {student?.full_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                              plan.risk_level === 'high'
                                ? 'bg-[#F40009]/20 text-[#F40009] border border-[#F40009]/40'
                                : plan.risk_level === 'medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : plan.risk_level === 'excelling'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {plan.risk_level.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs text-[#A0A0A0] mb-3 flex items-center space-x-2">
                          <span>Average: <strong className="text-[#F0F0F0]">{avg}%</strong></span>
                          <span>•</span>
                          <span className="capitalize text-[#F40009] font-semibold">
                            {plan.status.replace('_', ' ')}
                          </span>
                        </div>

                        {plan.target_goal && (
                          <div className="mb-2">
                            <p className="text-xs font-bold text-[#A0A0A0]">Goal:</p>
                            <p className="text-xs text-[#F0F0F0] line-clamp-2">{plan.target_goal}</p>
                          </div>
                        )}

                        {plan.action_plan && (
                          <div>
                            <p className="text-xs font-bold text-[#A0A0A0]">Action Plan:</p>
                            <p className="text-xs text-[#A0A0A0] line-clamp-2">{plan.action_plan}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-[#777777]">
                        <span>Updated: {new Date(plan.updated_at).toLocaleDateString()}</span>
                        <span className="text-[#F40009] font-bold hover:underline">Edit Plan</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monitoring / Resolved Plans */}
          {resolvedPlans.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl">
              <h3 className="text-base font-bold text-[#F0F0F0] mb-4">
                Monitoring & Resolved ({resolvedPlans.length})
              </h3>
              <div className="divide-y divide-[#2A2A2A]">
                {resolvedPlans.map((plan) => {
                  const student = students.find((s) => s.id === plan.student_id);
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleStudentChange(plan.student_id)}
                      className="py-3 flex items-center justify-between hover:bg-[#242424] px-3 rounded-xl cursor-pointer"
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#F0F0F0]">{student?.full_name}</span>
                        <p className="text-xs text-[#A0A0A0]">{plan.target_goal || 'Intervention completed'}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#242424] text-[#A0A0A0] border border-[#333333] capitalize">
                        {plan.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
