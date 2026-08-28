import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { QuizAttempt, Quiz, Student } from '../types';

interface AnalyticsChartsProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  students: Student[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  attempts,
  quizzes,
}) => {
  // 1. Calculate Score Distribution Buckets
  const scoreBuckets = [
    { range: '0-49% (Fail)', count: 0, fill: '#f43f5e' },
    { range: '50-69% (Pass)', count: 0, fill: '#f59e0b' },
    { range: '70-84% (Good)', count: 0, fill: '#6366f1' },
    { range: '85-100% (High)', count: 0, fill: '#10b981' },
  ];

  attempts.forEach((a) => {
    if (a.percentage < 50) scoreBuckets[0].count++;
    else if (a.percentage < 70) scoreBuckets[1].count++;
    else if (a.percentage < 85) scoreBuckets[2].count++;
    else scoreBuckets[3].count++;
  });

  // 2. Calculate Quiz-by-Quiz Averages
  const quizAverages = quizzes.map((quiz) => {
    const quizAttempts = attempts.filter((a) => a.quiz_id === quiz.id);
    const avg =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length
          )
        : 0;

    return {
      name: quiz.quiz_name.length > 20 ? quiz.quiz_name.substring(0, 18) + '...' : quiz.quiz_name,
      fullName: quiz.quiz_name,
      average: avg,
      submissions: quizAttempts.length,
    };
  });

  // 3. Status Breakdown for Donut Chart
  const statusCounts = [
    { name: 'Passed', value: attempts.filter((a) => a.percentage >= 60).length, color: '#10b981' },
    { name: 'Failed', value: attempts.filter((a) => a.percentage < 60).length, color: '#f43f5e' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quiz Performance Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Quiz Performance Comparison</h3>
            <p className="text-xs text-slate-500">Average score (%) achieved across Moodle tests</p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quizAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: any) => [`${value}%`, 'Average Score']}
              />
              <Bar dataKey="average" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Distribution Donut / Range Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Score Distribution</h3>
          <p className="text-xs text-slate-500">Student count grouped by mastery tiers</p>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreBuckets}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {scoreBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {scoreBuckets.map((b) => (
            <div key={b.range} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.fill }} />
              <span className="truncate">{b.range}: <strong className="text-slate-900">{b.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
