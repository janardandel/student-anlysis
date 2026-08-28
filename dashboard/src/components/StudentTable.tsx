import React, { useState } from 'react';
import { Search, Download, ArrowUpDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Student, QuizAttempt, Quiz, Course } from '../types';

interface StudentTableProps {
  students: Student[];
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  courses: Course[];
  onSelectStudent: (studentId: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  attempts,
  quizzes,
  courses,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter attempts based on search and dropdown selections
  const filteredAttempts = attempts.filter((attempt) => {
    const student = students.find((s) => s.id === attempt.student_id);
    const quiz = quizzes.find((q) => q.id === attempt.quiz_id);

    // Search filter
    const matchesSearch =
      student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz?.quiz_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Course filter
    const matchesCourse =
      selectedCourse === 'all' || quiz?.course_id === selectedCourse;

    // Quiz filter
    const matchesQuiz =
      selectedQuiz === 'all' || attempt.quiz_id === selectedQuiz;

    // Status filter
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'passed' && attempt.percentage >= 60) ||
      (selectedStatus === 'failed' && attempt.percentage < 60);

    return matchesSearch && matchesCourse && matchesQuiz && matchesStatus;
  });

  // Sort filtered attempts
  filteredAttempts.sort((a, b) => {
    const studentA = students.find((s) => s.id === a.student_id)?.full_name || '';
    const studentB = students.find((s) => s.id === b.student_id)?.full_name || '';

    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? studentA.localeCompare(studentB)
        : studentB.localeCompare(studentA);
    }
    if (sortBy === 'score') {
      return sortOrder === 'asc'
        ? a.percentage - b.percentage
        : b.percentage - a.percentage;
    }
    // Date
    return sortOrder === 'asc'
      ? new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
      : new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Quiz Name', 'Score', 'Max Score', 'Percentage', 'Status', 'Submitted At'];
    const rows = filteredAttempts.map((a) => {
      const student = students.find((s) => s.id === a.student_id);
      const quiz = quizzes.find((q) => q.id === a.quiz_id);
      return [
        `"${student?.full_name || ''}"`,
        `"${student?.email || ''}"`,
        `"${quiz?.quiz_name || ''}"`,
        a.score_obtained,
        a.max_score,
        `${a.percentage}%`,
        a.percentage >= 60 ? 'Passed' : 'Failed',
        new Date(a.submitted_at).toLocaleString(),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pitthugram_test_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#777777]" />
          <input
            type="text"
            placeholder="Search student, email, or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:outline-none focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 text-xs bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:outline-none focus:border-[#F40009]"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name || c.course_name}
              </option>
            ))}
          </select>

          {/* Quiz Filter */}
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            className="px-3 py-2 text-xs bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:outline-none focus:border-[#F40009]"
          >
            <option value="all">All Tests</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quiz_name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] font-semibold focus:outline-none focus:border-[#F40009]"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed ($\ge$60%)</option>
            <option value="failed">Failed (&lt;60%)</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#242424] hover:bg-[#333333] text-[#F0F0F0] border border-[#333333] rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#F40009]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#2A2A2A] text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                <th
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('name'); setSortOrder('asc'); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#F0F0F0]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Student</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777777]" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Test / Assessment</th>
                <th
                  onClick={() => {
                    if (sortBy === 'score') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('score'); setSortOrder('desc'); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#F0F0F0]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Score & Mastery</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777777]" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th
                  onClick={() => {
                    if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('date'); setSortOrder('desc'); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#F0F0F0]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Submission Date</span>
                    <ArrowUpDown className="w-3 h-3 text-[#777777]" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] text-sm">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#777777] text-sm">
                    No test submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => {
                  const student = students.find((s) => s.id === attempt.student_id);
                  const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
                  const isPassed = attempt.percentage >= 60;

                  return (
                    <tr
                      key={attempt.id}
                      onClick={() => onSelectStudent(attempt.student_id)}
                      className="hover:bg-[#242424] cursor-pointer transition-colors group"
                    >
                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#F0F0F0] group-hover:text-[#F40009] transition-colors">
                          {student?.full_name || 'Student'}
                        </div>
                        <div className="text-xs text-[#A0A0A0]">{student?.email}</div>
                      </td>

                      {/* Quiz info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#F0F0F0]">{quiz?.quiz_name || 'Assessment'}</div>
                        <div className="text-xs text-[#777777]">Attempt #{attempt.attempt_number}</div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-[#F0F0F0]">{attempt.percentage}%</span>
                          <span className="text-xs text-[#777777]">
                            ({attempt.score_obtained}/{attempt.max_score} pts)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 bg-[#2A2A2A] rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              attempt.percentage >= 80
                                ? 'bg-emerald-500'
                                : attempt.percentage >= 60
                                ? 'bg-blue-500'
                                : 'bg-[#F40009]'
                            }`}
                            style={{ width: `${Math.min(attempt.percentage, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPassed
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isPassed ? 'Passed' : 'Failed'}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-[#A0A0A0]">
                        {new Date(attempt.submitted_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        {new Date(attempt.submitted_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center text-xs font-bold text-[#F40009] group-hover:translate-x-0.5 transition-transform">
                          Plan & Review <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
