import React, { useState } from 'react';
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, DocumentItem } from '../types';

interface QuizViewProps {
  documents: DocumentItem[];
  onQuizComplete: (topic: string, score: number, total: number) => void;
  initialTopic?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  documents,
  onQuizComplete,
  initialTopic = 'Memory Hierarchy & Cache Calculations',
}) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [difficulty, setDifficulty] = useState<string>('Exam Grade');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Preloaded realistic university engineering past exam questions
  const defaultQuestions: QuizQuestion[] = [
    {
      id: 'q-1',
      questionText:
        'A 32-bit microprocessor system utilizes a 64 KB, 4-way set-associative cache with 32-byte block size. How many bits are required for the Set Index field in the physical address?',
      options: ['5 bits', '9 bits', '11 bits', '18 bits'],
      correctAnswerIndex: 1,
      pastQuestionYearTag: 'University Final Exam 2023 - Q1(a)',
      explanation:
        'Total cache lines = 64 KB / 32 B = 2048 lines. Since it is 4-way set associative, Number of Sets = 2048 / 4 = 512 sets. Set index bits = log2(512) = 9 bits. (Byte offset is log2(32) = 5 bits, Tag is 32 - 9 - 5 = 18 bits).',
      keyConceptTested: 'Cache Set Index & Address Partitioning',
    },
    {
      id: 'q-2',
      questionText:
        'In a classic 5-stage RISC pipeline (IF, ID, EX, MEM, WB), which technique resolves Read-After-Write (RAW) data hazards without inserting pipeline stall cycles (NOPs)?',
      options: [
        'Dynamic Branch Prediction',
        'Operand Forwarding (Bypassing)',
        'Instruction Cache Prefetching',
        'Delayed Branch Scheduling',
      ],
      correctAnswerIndex: 1,
      pastQuestionYearTag: 'University Final Exam 2023 - Q2(b)',
      explanation:
        'Operand forwarding routes the computed result directly from the output of the EX/MEM pipeline register back to the ALU input in the EX stage, supplying the needed operand to the next instruction without stalling.',
      keyConceptTested: 'Pipelining Hazards & Forwarding Logic',
    },
    {
      id: 'q-3',
      questionText:
        'A program executes 1,000,000 memory instructions. Cache L1 has a miss rate of 4%, and Cache L2 has a local miss rate of 15%. How many memory requests will reach the main memory?',
      options: ['40,000', '15,000', '6,000', '600'],
      correctAnswerIndex: 2,
      pastQuestionYearTag: 'CPE 401 CAT 1 (2024) - Q2',
      explanation:
        'L1 misses = 1,000,000 * 0.04 = 40,000 misses sent to L2 cache. Requests reaching Main Memory = 40,000 * 0.15 = 6,000 requests.',
      keyConceptTested: 'Multi-Level Cache Cascade Access',
    },
    {
      id: 'q-4',
      questionText:
        "When performing Booth's multiplication algorithm on signed binary integers, what action is taken when the bit pair (Q0, Q-1) is (1, 0)?",
      options: [
        'Arithmetic Shift Right (ASR) only',
        'Accumulator = Accumulator + Multiplicand, followed by ASR',
        'Accumulator = Accumulator - Multiplicand, followed by ASR',
        'Logical Shift Left (LSL) only',
      ],
      correctAnswerIndex: 2,
      pastQuestionYearTag: 'University Final Exam 2023 - Q3(a)',
      explanation:
        "Booth's recoding specifies: (1, 0) indicates the start of a run of 1s, requiring subtracting the multiplicand (A = A - M) followed by an arithmetic shift right (ASR) across [A, Q, Q-1].",
      keyConceptTested: "Booth's Signed Binary Multiplication",
    },
    {
      id: 'q-5',
      questionText:
        'Which cache write policy significantly reduces memory bus traffic by writing data back to main memory ONLY when a modified cache block is evicted?',
      options: [
        'Write-Through with Write Buffer',
        'Write-Back with Dirty Bit',
        'Write-Allocate with Direct Fetch',
        'No-Write Allocate with Non-Blocking Cache',
      ],
      correctAnswerIndex: 1,
      pastQuestionYearTag: 'CPE 401 CAT 1 (2024) - Q3',
      explanation:
        'Write-back updates only the cache line and marks the dirty bit as 1. Main memory is only written when the line is replaced by a subsequent miss, minimizing bus write bandwidth.',
      keyConceptTested: 'Cache Write Policies & Bus Congestion',
    },
  ];

  const [questions, setQuestions] = useState<QuizQuestion[]>(defaultQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQ = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;
    const updated = { ...selectedAnswers, [currentQuestionIndex]: optIndex };
    setSelectedAnswers(updated);
    setShowExplanation(true);

    // If answer is correct, light sparkle
    if (optIndex === currentQ.correctAnswerIndex) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finish Quiz
      setQuizFinished(true);
      const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ans]) => {
        return acc + (questions[Number(qIdx)].correctAnswerIndex === ans ? 1 : 0);
      }, 0);

      onQuizComplete(topic, score, questions.length);

      if (score / questions.length >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setQuizFinished(false);
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const docExcerpts = documents
        .map((d) => d.cleanedContent.slice(0, 500))
        .join('\n\n');

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount: 5,
          documentExcerpts: docExcerpts,
          quizType: 'Past Exam Question Simulation',
        }),
      });

      if (!res.ok) throw new Error('Quiz generation failed');
      const data = await res.json();

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        handleRestart();
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const scoreCount = Object.entries(selectedAnswers).reduce((acc, [qIdx, ans]) => {
    return acc + (questions[Number(qIdx)]?.correctAnswerIndex === ans ? 1 : 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <FileQuestion className="w-4 h-4" />
            <span>Past Exam Questions Drill Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {topic}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine your retention with actual past exam questions extracted and generated from your course materials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerateNewQuiz}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Extracting from Notes...' : 'Generate New Drill'}</span>
          </button>
        </div>
      </div>

      {!quizFinished ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQ.pastQuestionYearTag && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px]">
                  {currentQ.pastQuestionYearTag}
                </span>
              )}
            </div>
            <div className="text-slate-400">
              Concept: <strong className="text-indigo-400">{currentQ.keyConceptTested}</strong>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans">
            {currentQ.questionText}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
              const isCorrect = currentQ.correctAnswerIndex === optIdx;

              let btnClass = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                } else {
                  btnClass = 'bg-slate-950 border-slate-800/50 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswered}
                  className={`w-full flex items-start space-x-3 p-4 rounded-xl text-left text-sm transition-all border ${btnClass}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-fadeIn text-xs sm:text-sm">
              <div className="flex items-center space-x-2 font-bold text-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Marking Scheme & University Examiner Explanation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation Action */}
          {isAnswered && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Completed Results Card */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Drill Session Complete!</h2>
            <p className="text-sm text-slate-400">
              Your results have been recorded in the Study Frequency & Progress Examination system.
            </p>
          </div>

          {/* Score Badge */}
          <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-sm text-slate-400">Your Score:</span>
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {scoreCount} / {questions.length}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
              {Math.round((scoreCount / questions.length) * 100)}%
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {scoreCount === questions.length
              ? 'Outstanding! You have mastered the core calculations and theory for this past exam module.'
              : scoreCount >= 3
              ? 'Solid performance! Review the questions you missed using the AI Tutor Chat to solidify your tag calculations before the final.'
              : 'Keep practicing! Revisit the Lecture Notes tab for Module 3 to refresh formula derivations.'}
          </p>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Drill</span>
            </button>
            <button
              onClick={handleGenerateNewQuiz}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Next Topic Drill</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
