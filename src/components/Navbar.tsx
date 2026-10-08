import React from 'react';
import { 
  Bot, 
  FileText, 
  Compass, 
  FileQuestion, 
  Activity, 
  Terminal, 
  Flame, 
  GraduationCap, 
  CheckCircle2, 
  Award,
  Sparkles
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'materials' | 'learning_path' | 'quiz' | 'analytics' | 'capstone';
  onSelectTab: (tab: 'chat' | 'materials' | 'learning_path' | 'quiz' | 'analytics' | 'capstone') => void;
  student: StudentProfile;
  totalDocsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  student,
  totalDocsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner: University Capstone & Student Streak */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('chat')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  EduRAG AI
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CPE Capstone
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personalized Learning & Exam Preparation with pgvector RAG
              </p>
            </div>
          </div>

          {/* Quick Stats: Student Streak & Exam Readiness */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Streak Counter */}
            <div 
              onClick={() => onSelectTab('analytics')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-400 cursor-pointer hover:bg-orange-900/50 transition-all text-xs font-semibold"
              title="Daily study frequency examination streak"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>{student.studyStreakDays} Day Streak</span>
            </div>

            {/* Exam Readiness Badge */}
            <div 
              onClick={() => onSelectTab('analytics')}
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 cursor-pointer hover:bg-emerald-900/50 transition-all text-xs"
              title="Calculated from tool usage frequency & quiz mastery"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>
                Readiness: <strong className="text-white font-bold">{student.examReadinessScore}%</strong>
              </span>
            </div>

            {/* Student Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-700 border border-indigo-400 flex items-center justify-center font-bold text-xs text-white">
                EU
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-medium text-slate-200">{student.name}</div>
                <div className="text-[11px] text-slate-400">{student.level} • {student.department}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => onSelectTab('chat')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor Chat</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded font-mono">ChatGPT</span>
          </button>

          <button
            onClick={() => onSelectTab('materials')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes & Past Questions</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 rounded-full font-mono">
              {totalDocsCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('learning_path')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'learning_path'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Learning Path</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Past Questions Drill</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Study Frequency & Progress</span>
          </button>

          <button
            onClick={() => onSelectTab('capstone')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'capstone'
                ? 'bg-slate-800 text-cyan-300 ring-1 ring-cyan-500/50'
                : 'text-cyan-400/90 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>FastAPI & pgvector Hub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
