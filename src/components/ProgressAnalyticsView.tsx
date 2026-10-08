import React from 'react';
import { 
  Activity, 
  Flame, 
  Award, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Brain, 
  BarChart3, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { StudentProfile, StudyFrequencyMetric } from '../types';

interface ProgressAnalyticsViewProps {
  student: StudentProfile;
  metrics: StudyFrequencyMetric[];
  onNavigateToQuiz: () => void;
  onNavigateToChat: () => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  student,
  metrics,
  onNavigateToQuiz,
  onNavigateToChat,
}) => {
  // Aggregate stats
  const totalMinutes = metrics.reduce((acc, m) => acc + m.minutesSpent, 0);
  const totalQueries = metrics.reduce((acc, m) => acc + m.queriesCount, 0);
  const totalQuizzes = metrics.reduce((acc, m) => acc + m.quizzesTaken, 0);
  const activeDaysCount = metrics.filter((m) => m.minutesSpent > 0).length;
  const consistencyRate = Math.round((activeDaysCount / metrics.length) * 100);

  // Spaced Repetition Topics
  const spacedRepetitionCards = [
    {
      topic: 'Direct Mapped vs Set-Associative Cache Indexing',
      lastStudied: '3 days ago',
      retentionScore: 68,
      status: 'Due for Review',
      action: 'Quick Past Question Drill',
    },
    {
      topic: 'Booth Algorithm Signed Multiplication (Tabular Steps)',
      lastStudied: '1 day ago',
      retentionScore: 89,
      status: 'High Retention',
      action: 'Mastered',
    },
    {
      topic: 'RISC Pipelining RAW Hazards & Forwarding MUX Logic',
      lastStudied: '5 days ago',
      retentionScore: 54,
      status: 'Decaying (Critical)',
      action: 'Review Module 2 Notes',
    },
    {
      topic: 'Multi-Level Cache AMAT Calculation Formulas',
      lastStudied: 'Today',
      retentionScore: 95,
      status: 'Fresh Retention',
      action: 'On Track',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Academic Performance & Usage Frequency Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Student Study Frequency & Progress Examination
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            This module continuously examines how frequently you utilize the RAG tool, your active study streaks, retention decay intervals, and your readiness for final university examinations.
          </p>
        </div>

        {/* Readiness Gauge */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center space-x-5 shrink-0 shadow-lg">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - student.examReadinessScore / 100)}
                className="text-emerald-400 transition-all duration-1000"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono font-bold text-lg text-white">
              {student.examReadinessScore}%
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Exam Readiness
            </div>
            <div className="text-sm font-bold text-emerald-400">
              Strong Probability of Grade A
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Based on {totalQuizzes} drills & daily usage
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline space-x-2">
            <span>{student.studyStreakDays} Days</span>
            <span className="text-xs text-orange-400 font-semibold font-sans">Active</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Personal Record: <strong>{student.longestStreakDays} days</strong>
          </div>
        </div>

        {/* Study Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tool Usage Frequency</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline space-x-2">
            <span>{consistencyRate}%</span>
            <span className="text-xs text-indigo-400 font-semibold font-sans">Consistency</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Active on <strong>{activeDaysCount} of {metrics.length}</strong> examined days
          </div>
        </div>

        {/* Total Time Studied */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Time Invested</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {Math.round(totalMinutes / 60)} hrs {totalMinutes % 60} mins
          </div>
          <div className="text-[11px] text-slate-400">
            Average: <strong>{Math.round(totalMinutes / metrics.length)} mins / day</strong>
          </div>
        </div>

        {/* Consultations & Drills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions Answered</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalQueries + totalQuizzes * 5}
          </div>
          <div className="text-[11px] text-slate-400">
            {totalQueries} chat queries • {totalQuizzes} past exam drills
          </div>
        </div>
      </div>

      {/* Daily Usage Heatmap / Activity Calendar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Daily Tool Usage Frequency Activity</span>
            </h2>
            <p className="text-xs text-slate-400">
              Examining engagement regularity across consecutive days to prevent cramming.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Less Frequent</span>
            <div className="flex space-x-1">
              <span className="w-3 h-3 rounded bg-slate-800 inline-block" />
              <span className="w-3 h-3 rounded bg-indigo-900 inline-block" />
              <span className="w-3 h-3 rounded bg-indigo-700 inline-block" />
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block" />
            </div>
            <span>High Intensity</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {metrics.map((day, idx) => {
            const intensityBg: Record<string, string> = {
              none: 'bg-slate-800/40 border-slate-800',
              light: 'bg-indigo-950/40 border-indigo-900/60 text-indigo-300',
              moderate: 'bg-indigo-900/40 border-indigo-700/60 text-indigo-200',
              high: 'bg-indigo-700/50 border-indigo-500/60 text-white',
              peak: 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/20',
            };

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${intensityBg[day.intensity]}`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold">{day.date.slice(5)}</span>
                  <span className="text-[10px] uppercase font-bold">{day.intensity}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-base font-bold font-mono">
                    {day.minutesSpent} mins
                  </div>
                  <div className="text-[11px] opacity-80">
                    {day.queriesCount} queries • {day.quizzesTaken} tests
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spaced Repetition Retention Decay & Remediation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ebbinghaus Forgetting Curve Alerts */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Spaced Repetition Retention Decay Schedule</span>
              </h2>
              <p className="text-xs text-slate-400">
                Topics scheduled for review based on time elapsed since your last tool interaction.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {spacedRepetitionCards.map((item, idx) => {
              const isCritical = item.retentionScore < 60;
              const isDue = item.retentionScore < 75;

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {item.topic}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : isDue
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Last drilled: {item.lastStudied}</span>
                      <span>•</span>
                      <span>Memory Retention: <strong className="text-slate-200 font-mono">{item.retentionScore}%</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToQuiz}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all shrink-0 self-start sm:self-auto"
                  >
                    <span>{item.action}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Examiner Diagnostic Report */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Examiner Diagnostic Recommendation
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-semibold">
                High Mastery: Memory Hierarchy (Module 3)
              </strong>
              <p className="text-slate-400 text-[11px]">
                You solved 32-bit cache tag allocation in under 2 minutes with 100% accuracy. Ready for final examination questions.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-semibold">
                Attention Required: Pipelining RAW Hazards
              </strong>
              <p className="text-slate-400 text-[11px]">
                Forwarding multiplexer datapath questions showed a 25% error rate on branch penalties. Recommended action: consult AI Tutor on 2023 Exam Q2.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-cyan-400 block font-semibold">
                Tool Usage Frequency Impact
              </strong>
              <p className="text-slate-400 text-[11px]">
                Your 6-day study streak has reduced forgetting decay by 42% compared to single-day massed cramming. Maintain 1.5 hrs/day leading into finals.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToChat}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            Consult AI Tutor on Weak Areas
          </button>
        </div>
      </div>
    </div>
  );
};
