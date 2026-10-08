export type DocType = 'lecture_note' | 'past_question' | 'test_question' | 'syllabus' | 'lab_manual';

export interface DocumentItem {
  id: string;
  title: string;
  docType: DocType;
  courseCode: string;
  courseTitle: string;
  academicYear?: string;
  rawContent: string;
  cleanedContent: string;
  tokenCount: number;
  uploadedAt: string;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  docName: string;
  docType: DocType;
  courseCode: string;
  chunkIndex: number;
  text: string;
  tokenLength: number;
  embedding?: number[];
  similarity?: number;
}

export interface Citation {
  chunkId: string;
  docName: string;
  docType: DocType;
  courseCode: string;
  chunkIndex: number;
  text: string;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  audioBase64?: string;
  isAudioPlaying?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  courseCode: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface LearningModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  estimatedHours: number;
  examFrequencyWeight: string; // e.g. "High Yield (Appeared in 85% past exams)"
  keyTopics: string[];
  completedTopics: string[];
  recommendedPastQuestionDrill: string;
  milestoneTask: string;
  status: 'pending' | 'in_progress' | 'mastered';
}

export interface LearningPathData {
  courseTitle: string;
  courseCode: string;
  totalEstimatedHours: number;
  studyPlanSummary: string;
  examReadinessStrategy: string;
  modules: LearningModule[];
  frequencyExamAdvice: {
    recommendedDailyCadence: string;
    spacedRepetitionIntervals: string;
    criticalMilestoneDeadlines: string[];
  };
  completionPercentage: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  pastQuestionYearTag?: string;
  explanation: string;
  keyConceptTested: string;
}

export interface QuizAttemptResult {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  userAnswers: { [questionId: string]: number };
}

export interface StudentProfile {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  targetExamDate: string;
  dailyGoalHours: number;
  studyStreakDays: number;
  longestStreakDays: number;
  totalStudyMinutes: number;
  examReadinessScore: number;
}

export interface StudyFrequencyMetric {
  date: string;
  sessionsCount: number;
  minutesSpent: number;
  queriesCount: number;
  quizzesTaken: number;
  intensity: 'none' | 'light' | 'moderate' | 'high' | 'peak';
}
