/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { MaterialsView } from './components/MaterialsView';
import { LearningPathView } from './components/LearningPathView';
import { QuizView } from './components/QuizView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { CapstoneHubView } from './components/CapstoneHubView';

import { 
  DEFAULT_DOCUMENTS, 
  DEFAULT_LEARNING_PATH, 
  INITIAL_STUDY_METRICS 
} from './data/defaultMaterials';
import { 
  DocumentItem, 
  LearningPathData, 
  StudentProfile, 
  StudyFrequencyMetric 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'materials' | 'learning_path' | 'quiz' | 'analytics' | 'capstone'
  >('chat');

  // Student Profile State
  const [student, setStudent] = useState<StudentProfile>({
    name: 'Emmanuel Unobe',
    matricNumber: 'CPE/2021/0412',
    department: 'Computer Engineering',
    level: 'Undergraduate (400L)',
    targetExamDate: '2026-11-15',
    dailyGoalHours: 2,
    studyStreakDays: 6,
    longestStreakDays: 14,
    totalStudyMinutes: 515,
    examReadinessScore: 82,
  });

  // Materials & Vector Chunks State
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCUMENTS);

  // Personalized Learning Path State
  const [learningPath, setLearningPath] = useState<LearningPathData>(DEFAULT_LEARNING_PATH);

  // Study Frequency Metrics State
  const [studyMetrics, setStudyMetrics] = useState<StudyFrequencyMetric[]>(INITIAL_STUDY_METRICS);

  // Active quiz topic filter
  const [activeQuizTopic, setActiveQuizTopic] = useState<string>('Memory Hierarchy & Cache Calculations');

  // Flatten all document chunks for RAG Engine retrieval
  const allChunks = documents.flatMap((d) => d.chunks);

  // Handlers
  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    recordStudyActivity(10); // 10 mins for uploading & processing document
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleUpdateLearningPath = (updated: LearningPathData) => {
    setLearningPath(updated);
    // Recalculate readiness score based on path completion
    const newScore = Math.min(98, Math.max(50, Math.round(60 + updated.completionPercentage * 0.35)));
    setStudent((prev) => ({
      ...prev,
      examReadinessScore: newScore,
    }));
  };

  const recordStudyActivity = (minutesSpent: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setStudyMetrics((prev) => {
      const existingToday = prev.find((m) => m.date === todayStr);
      if (existingToday) {
        return prev.map((m) =>
          m.date === todayStr
            ? {
                ...m,
                minutesSpent: m.minutesSpent + minutesSpent,
                queriesCount: m.queriesCount + 1,
                intensity: m.minutesSpent + minutesSpent > 90 ? 'peak' : 'high',
              }
            : m
        );
      } else {
        return [
          ...prev.slice(1),
          {
            date: todayStr,
            sessionsCount: 1,
            minutesSpent,
            queriesCount: 1,
            quizzesTaken: 0,
            intensity: 'light',
          },
        ];
      }
    });

    setStudent((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + minutesSpent,
    }));
  };

  const handleQuizComplete = (topic: string, score: number, total: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setStudyMetrics((prev) =>
      prev.map((m) =>
        m.date === todayStr
          ? {
              ...m,
              quizzesTaken: m.quizzesTaken + 1,
              minutesSpent: m.minutesSpent + 15,
            }
          : m
      )
    );

    const percentage = score / total;
    setStudent((prev) => {
      const readinessBoost = percentage >= 0.8 ? 3 : percentage >= 0.5 ? 1 : 0;
      return {
        ...prev,
        examReadinessScore: Math.min(99, prev.examReadinessScore + readinessBoost),
        totalStudyMinutes: prev.totalStudyMinutes + 15,
      };
    });
  };

  const handleStartQuizFromModule = (topic: string) => {
    setActiveQuizTopic(topic);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        student={student}
        totalDocsCount={documents.length}
      />

      {/* Main Tab View */}
      <div className="flex-1">
        {activeTab === 'chat' && (
          <ChatView
            allChunks={allChunks}
            student={student}
            onLaunchQuizTopic={handleStartQuizFromModule}
            onRecordStudyActivity={recordStudyActivity}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'learning_path' && (
          <LearningPathView
            learningPath={learningPath}
            onUpdateLearningPath={handleUpdateLearningPath}
            student={student}
            documents={documents}
            onStartQuiz={handleStartQuizFromModule}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            documents={documents}
            onQuizComplete={handleQuizComplete}
            initialTopic={activeQuizTopic}
          />
        )}

        {activeTab === 'analytics' && (
          <ProgressAnalyticsView
            student={student}
            metrics={studyMetrics}
            onNavigateToQuiz={() => setActiveTab('quiz')}
            onNavigateToChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'capstone' && <CapstoneHubView />}
      </div>
    </div>
  );
}
