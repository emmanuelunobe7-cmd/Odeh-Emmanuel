import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  RefreshCw, 
  Target, 
  Flame, 
  GraduationCap,
  ChevronRight,
  TrendingUp,
  FileQuestion
} from 'lucide-react';
import { LearningPathData, LearningModule, StudentProfile, DocumentItem } from '../types';

interface LearningPathViewProps {
  learningPath: LearningPathData;
  onUpdateLearningPath: (updated: LearningPathData) => void;
  student: StudentProfile;
  documents: DocumentItem[];
  onStartQuiz: (topic: string) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  learningPath,
  onUpdateLearningPath,
  student,
  documents,
  onStartQuiz,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudentLevel, setSelectedStudentLevel] = useState(student.level || 'Undergraduate');
  const [targetExamDate, setTargetExamDate] = useState(student.targetExamDate || '2026-11-15');
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedCourse, setSelectedCourse] = useState('CPE401 - Advanced Computer Architecture');

  // Toggle topic completion
  const handleToggleTopic = (moduleId: string, topic: string) => {
    const updatedModules = learningPath.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;

      const isCompleted = mod.completedTopics.includes(topic);
      const newCompleted = isCompleted
        ? mod.completedTopics.filter((t) => t !== topic)
        : [...mod.completedTopics, topic];

      const allMastered = newCompleted.length === mod.keyTopics.length;
      return {
        ...mod,
        completedTopics: newCompleted,
        status: allMastered ? ('mastered' as const) : newCompleted.length > 0 ? ('in_progress' as const) : ('pending' as const),
      };
    });

    // Calculate total completion percentage
    const totalTopics = updatedModules.reduce((acc, m) => acc + m.keyTopics.length, 0);
    const completedTopics = updatedModules.reduce((acc, m) => acc + m.completedTopics.length, 0);
    const newCompletionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    onUpdateLearningPath({
      ...learningPath,
      modules: updatedModules,
      completionPercentage: newCompletionPercentage,
    });
  };

  // Re-generate learning path with Gemini API
  const handleRegeneratePath = async () => {
    setIsGenerating(true);
    try {
      const docsSummary = documents
        .map((d) => `- ${d.title} (${d.docType}, ${d.courseCode}): ${d.chunks.length} chunks`)
        .join('\n');

      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentsSummary: docsSummary,
          studentLevel: selectedStudentLevel,
          targetExamDate: targetExamDate,
          hoursPerDay: dailyHours,
          courseTitle: selectedCourse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate path: ${response.status}`);
      }

      const generatedData = await response.json();

      // Ensure completedTopics is array for each module
      const normalizedModules = generatedData.modules.map((m: any, idx: number) => ({
        ...m,
        id: m.id || `gen-mod-${idx + 1}`,
        completedTopics: [],
        status: 'pending' as const,
      }));

      onUpdateLearningPath({
        ...generatedData,
        courseCode: 'CPE401',
        completionPercentage: 0,
        modules: normalizedModules,
      });
    } catch (err) {
      console.error('Error generating learning path:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Personalized Adaptive Learning Path Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {learningPath.courseTitle}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {learningPath.studyPlanSummary}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Estimated Time: <strong>{learningPath.totalEstimatedHours} Hours</strong></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Exam Target: <strong>{targetExamDate}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Daily Commitment: <strong>{dailyHours} hrs/day</strong></span>
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shrink-0 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Overall Roadmap Mastery</span>
              <span className="font-mono text-indigo-400 font-bold">{learningPath.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${learningPath.completionPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Based on your continuous tool usage and topic mastery, your projected exam readiness is high!
            </div>
          </div>
        </div>

        {/* Generator Controls Accordion / Toolbar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <span className="text-slate-500 mr-2">Target Exam:</span>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <span className="text-slate-500 mr-2">Pace:</span>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value={1}>1 hr / day (Relaxed)</option>
                <option value={2}>2 hrs / day (Recommended)</option>
                <option value={3}>3 hrs / day (Intensive)</option>
                <option value={4}>4 hrs / day (Crash Course)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRegeneratePath}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Regenerate Adaptive Path'}</span>
          </button>
        </div>
      </div>

      {/* Spaced Repetition & Exam Strategy Advice Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Exam Frequency Strategy (Based on 2021-2024 Past Papers)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {learningPath.examReadinessStrategy}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Spaced Repetition & Study Cadence</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {learningPath.frequencyExamAdvice.spacedRepetitionIntervals}
          </p>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <span>Weekly Syllabus & Milestone Modules ({learningPath.modules.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {learningPath.modules.map((module) => {
            const isFullyMastered = module.completedTopics.length === module.keyTopics.length;
            const isHighYield = module.examFrequencyWeight.toLowerCase().includes('high');

            return (
              <div
                key={module.id}
                className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all ${
                  isFullyMastered
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Module Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold">
                        Week {module.weekNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isHighYield
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {module.examFrequencyWeight}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{module.estimatedHours} Hours Required</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Key Topics Checklist */}
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Core Topics to Master (Click to mark complete):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {module.keyTopics.map((topic, tIdx) => {
                          const isDone = module.completedTopics.includes(topic);
                          return (
                            <button
                              key={tIdx}
                              onClick={() => handleToggleTopic(module.id, topic)}
                              className={`flex items-start space-x-2.5 p-2 rounded-xl text-left text-xs transition-all border ${
                                isDone
                                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 line-through'
                                  : 'bg-slate-950 text-slate-300 border-slate-800/80 hover:bg-slate-800/60'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                              )}
                              <span className="leading-snug">{topic}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Milestone & Drill Action Sidebar */}
                  <div className="lg:w-72 bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-4 shrink-0">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Weekly Milestone Task</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {module.milestoneTask}
                      </p>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">
                        <strong>Recommended Drill:</strong> {module.recommendedPastQuestionDrill}
                      </div>
                      <button
                        onClick={() => onStartQuiz(module.title)}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold transition-all shadow-sm"
                      >
                        <FileQuestion className="w-3.5 h-3.5" />
                        <span>Launch Past Questions Drill</span>
                      </button>
                    </div>
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
