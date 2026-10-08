import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google GenAI on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe error responses
function handleGenAiError(res: Response, err: unknown, fallbackMessage: string) {
  console.error('Gemini API Error:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  return res.status(500).json({
    error: fallbackMessage,
    details: errorMessage,
  });
}

// 1. RAG Chat Endpoint (ChatGPT-style with document context)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, retrievedChunks, studentProfile, examFocus } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // Format retrieved RAG chunks
    let ragContextText = '';
    if (retrievedChunks && Array.isArray(retrievedChunks) && retrievedChunks.length > 0) {
      ragContextText = retrievedChunks
        .map(
          (c: { docName: string; chunkIndex: number; text: string; similarity?: number; docType?: string }, idx: number) =>
            `--- [SOURCE ${idx + 1}: ${c.docName} (${c.docType || 'Material'}) - Chunk #${c.chunkIndex} (Relevance: ${Math.round((c.similarity || 0.8) * 100)}%)] ---\n${c.text}\n`
        )
        .join('\n');
    }

    const systemInstruction = `You are EduRAG AI, a world-class personalized academic tutor and ChatGPT-style study mentor for university students (especially Computer Engineering and STEM).

Your objective is to help the student achieve deep conceptual mastery, ace their exams, and solve past questions with precision.

CONTEXT & GROUNDING INSTRUCTIONS:
1. Below are relevant excerpts retrieved via RAG (Retrieval-Augmented Generation) from the student's uploaded lecture notes, past exam questions, test questions, and course materials.
2. ALWAYS prioritize grounding your explanations in these uploaded documents.
3. When using information from the sources, cite them clearly using tags like [Source: Lecture Notes, Module 2] or [Past Question 2023, Q4].
4. If the student asks something not fully covered in their notes, answer using sound academic and engineering principles, but explicitly clarify: "Note: Expanding beyond your uploaded notes to provide standard computer engineering context."
5. Break down complex engineering problems step-by-step:
   - Theoretical intuition
   - Mathematical formula / derivation (use clean formatting)
   - Step-by-step solved example
   - Key exam pitfall / what university examiners look for
6. Match the student's current mastery level: ${studentProfile?.level || 'Undergraduate'} (Target Exam Date: ${studentProfile?.targetExamDate || 'Upcoming Finals'}).
${examFocus ? `SPECIAL EXAM FOCUS: Prioritize past paper pattern analysis, high-frequency question recognition, and marking scheme tips.` : ''}

RETRIEVED KNOWLEDGE BASE EXCERPTS (FROM PGVECTOR RAG):
${ragContextText || '(No specific document chunks retrieved for this general query. Answer using core engineering curriculum standards.)'}
`;

    // Build chat history for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, but I was unable to generate an answer. Please retry.';
    return res.json({
      reply,
      retrievedChunksCount: retrievedChunks?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleGenAiError(res, err, 'Failed to generate study response.');
  }
});

// 2. Adaptive Personalized Learning Path Generator
app.post('/api/learning-path', async (req: Request, res: Response) => {
  try {
    const { documentsSummary, studentLevel, targetExamDate, hoursPerDay, courseTitle } = req.body;

    const prompt = `Generate a rigorous, highly personalized, week-by-week and module-by-module learning path for a university student.
Course / Subject: ${courseTitle || 'Computer Engineering Core'}
Student Self-Assessed Level: ${studentLevel || 'Intermediate'}
Target Exam Date: ${targetExamDate || '4 weeks'}
Study Commitment: ${hoursPerDay || 2} hours per day
Available Uploaded Materials Overview:
${documentsSummary || 'Lecture notes on Digital Logic, Computer Architecture, Memory Hierarchy, Cache Mapping, and 4 years of Past Questions.'}

Generate a structured JSON learning path. Each module must contain specific engineering topics, high-frequency exam flags (past questions frequency), estimated hours, key formulas/concepts to master, and practice objectives.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic curriculum designer and computer engineering professor. Return valid structured JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseTitle: { type: Type.STRING },
            totalEstimatedHours: { type: Type.INTEGER },
            studyPlanSummary: { type: Type.STRING },
            examReadinessStrategy: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  weekNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedHours: { type: Type.NUMBER },
                  examFrequencyWeight: { type: Type.STRING, description: 'High Yield (Appeared in 80% past exams), Medium Yield, or Foundational' },
                  keyTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedPastQuestionDrill: { type: Type.STRING },
                  milestoneTask: { type: Type.STRING },
                },
                required: ['id', 'weekNumber', 'title', 'description', 'estimatedHours', 'examFrequencyWeight', 'keyTopics', 'milestoneTask'],
              },
            },
            frequencyExamAdvice: {
              type: Type.OBJECT,
              properties: {
                recommendedDailyCadence: { type: Type.STRING },
                spacedRepetitionIntervals: { type: Type.STRING },
                criticalMilestoneDeadlines: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['recommendedDailyCadence', 'spacedRepetitionIntervals', 'criticalMilestoneDeadlines'],
            },
          },
          required: ['courseTitle', 'totalEstimatedHours', 'studyPlanSummary', 'examReadinessStrategy', 'modules', 'frequencyExamAdvice'],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    return res.json(parsed);
  } catch (err) {
    return handleGenAiError(res, err, 'Failed to generate personalized learning path.');
  }
});

// 3. Past Question Drill & Quiz Generator
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, questionCount, documentExcerpts, quizType } = req.body;

    const prompt = `Generate a realistic university examination quiz (${questionCount || 5} questions) for university engineering students.
Topic: ${topic || 'Computer Architecture & Memory Systems'}
Difficulty: ${difficulty || 'Moderate/Exam Grade'}
Type: ${quizType || 'Past Exam Simulation with Multiple Choice and Analytical Questions'}
Reference Material & Past Question Context:
${documentExcerpts || 'Focus on Direct Mapped vs Associative Cache, Pipelining hazards, Booth Algorithm, and Interrupt handling.'}

Generate comprehensive questions with detailed step-by-step engineering explanations for why the correct option is right and why common distractors fail.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a university exam committee chair in Computer Engineering. Generate exact, valid JSON quiz schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  pastQuestionYearTag: { type: Type.STRING, description: 'e.g., Exam 2023 Q3b or University Final 2022' },
                  explanation: { type: Type.STRING },
                  keyConceptTested: { type: Type.STRING },
                },
                required: ['id', 'questionText', 'options', 'correctAnswerIndex', 'explanation', 'keyConceptTested'],
              },
            },
          },
          required: ['title', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);
    return res.json(parsed);
  } catch (err) {
    return handleGenAiError(res, err, 'Failed to generate past question drill quiz.');
  }
});

// 4. Text-to-Speech (Gemini TTS for Audio Explanations)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text string is required' });
    }

    // Keep within reasonable length for quick spoken summary
    const truncatedText = text.slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: 'Clear, encouraging university professor and study coach',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err) {
    return handleGenAiError(res, err, 'TTS generation failed.');
  }
});

// 5. Semantic Vector Embedding Endpoint
app.post('/api/embed', async (req: Request, res: Response) => {
  try {
    const { texts } = req.body;
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'texts array is required' });
    }

    // Call Gemini Embeddings
    const embeddings: number[][] = [];
    for (const text of texts.slice(0, 20)) {
      try {
        const result = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: text,
        });
        const rawResult = result as unknown as { embedding?: { values?: number[] }; embeddings?: Array<{ values?: number[] }> };
        const vector = rawResult.embedding?.values || rawResult.embeddings?.[0]?.values || [];
        embeddings.push(vector.length > 0 ? vector : generateFallbackVector(text));
      } catch (embErr) {
        // Fallback mathematical deterministic embedding generator if model quota throttled
        embeddings.push(generateFallbackVector(text));
      }
    }

    return res.json({ embeddings });
  } catch (err) {
    return handleGenAiError(res, err, 'Vector embedding generation failed.');
  }
});

// Helper for deterministic vector generation when testing or offline
function generateFallbackVector(text: string, dimensions = 64): number[] {
  const vec = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    let hash = 0;
    for (let c = 0; c < w.length; c++) {
      hash = (hash << 5) - hash + w.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;
  }
  // Normalize
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map(v => Number((v / norm).toFixed(5)));
}

// Start Server with Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduRAG AI Full-Stack Server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
