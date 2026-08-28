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
  // 1. Score Distribution Buckets (Pitthugram Palette: Danger #F40009, Warning #F59E0B, Secondary #3B82F6, Success #10B981)
  const scoreBuckets = [
    { range: '0-49% (Fail)', count: 0, fill: '#F40009' },
    { range: '50-69% (Pass)', count: 0, fill: '#F59E0B' },
    { range: '70-84% (Good)', count: 0, fill: '#3B82F6' },
    { range: '85-100% (High)', count: 0, fill: '#10B981' },
  ];

  attempts.forEach((a) => {
    if (a.percentage < 50) scoreBuckets[0].count++;
    else if (a.percentage < 70) scoreBuckets[1].count++;
    else if (a.percentage < 85) scoreBuckets[2].count++;
    else scoreBuckets[3].count++;
  });

  // 2. Quiz-by-Quiz Averages
  const quizAverages = quizzes.map((quiz) => {
    const quizAttempts = attempts.filter((a) => a.quiz_id === quiz.id);
    const avg =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length
          )
        : 0;

    return {
      name: quiz.quiz_name.length > 18 ? quiz.quiz_name.substring(0, 16) + '...' : quiz.quiz_name,
      fullName: quiz.quiz_name,
      average: avg,
      submissions: quizAttempts.length,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quiz Performance Bar Chart */}
      <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F0F0F0]">Test Performance Comparison</h3>
            <p className="text-xs text-[#A0A0A0]">Average score (%) achieved across Moodle tests</p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quizAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#A0A0A0', fontSize: 11 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                  border: '1px solid #333333',
                  color: '#F0F0F0',
                }}
                itemStyle={{ color: '#F0F0F0' }}
                formatter={(value: any) => [`${value}%`, 'Average Score']}
              />
              <Bar dataKey="average" fill="#F40009" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Distribution Donut Chart */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#F0F0F0]">Score Mastery Distribution</h3>
          <p className="text-xs text-[#A0A0A0]">Student breakdown by performance tiers</p>

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
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#1A1A1A" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E1E',
                    borderRadius: '12px',
                    border: '1px solid #333333',
                    color: '#F0F0F0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2A2A2A] text-xs text-[#A0A0A0]">
          {scoreBuckets.map((b) => (
            <div key={b.range} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.fill }} />
              <span className="truncate">{b.range}: <strong className="text-[#F0F0F0]">{b.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
