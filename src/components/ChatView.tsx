import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  FileText, 
  Layers, 
  Plus, 
  ExternalLink,
  Flame,
  FileQuestion,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, ChatSession, Citation, DocumentChunk, StudentProfile } from '../types';
import { RAGEngine } from '../utils/ragEngine';

interface ChatViewProps {
  allChunks: DocumentChunk[];
  student: StudentProfile;
  onLaunchQuizTopic?: (topic: string) => void;
  onRecordStudyActivity?: (minutes: number) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  allChunks,
  student,
  onLaunchQuizTopic,
  onRecordStudyActivity,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Cache Tag & Offset Calculation Drill',
      courseCode: 'CPE401',
      createdAt: '2026-10-08T09:00:00Z',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'How do I solve Question 1 from the 2023 Past Question paper regarding the 64 KB 4-way set associative cache?',
          timestamp: '2026-10-08T09:00:05Z',
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: `Here is the comprehensive, step-by-step solution for **CPE 401 Final Examination 2023 - Question 1 [15 Marks]**, grounded directly in your uploaded past questions and lecture notes.

### Problem Breakdown
- **Architecture**: 32-bit microprocessor (Address space = $2^{32}$ bytes = 4 GB)
- **Cache Size**: $64\\text{ KB} = 64 \\times 1024 = 65,536\\text{ bytes}$
- **Block Size**: $32\\text{ bytes}$
- **Associativity**: 4-way set-associative ($k = 4$)

---

### Step (i): Determine the Number of Sets [3 Marks]
1. First, calculate the total number of cache lines (blocks):
   $$\\text{Total Lines} = \\frac{\\text{Cache Size}}{\\text{Block Size}} = \\frac{64\\text{ KB}}{32\\text{ B}} = \\frac{65,536}{32} = 2,048\\text{ lines}$$
2. Since the cache is 4-way set associative, each set contains 4 lines:
   $$\\text{Number of Sets} = \\frac{\\text{Total Lines}}{k} = \\frac{2,048}{4} = 512\\text{ sets}$$
*(Notice: $512 = 2^9$, which means 9 bits are needed for the Set Index).*

---

### Step (ii): Bit Fields in the 32-bit Physical Address [6 Marks]
A physical address in set-associative cache is partitioned into three fields:
\`[ Tag Bits | Set Index Bits | Byte Offset Bits ]\`

1. **Byte Offset Bits**:
   $$\\text{Offset Bits} = \\log_2(\\text{Block Size}) = \\log_2(32) = 5\\text{ bits}$$
   *(Selects the exact byte within the 32-byte cache line).*

2. **Set Index Bits**:
   $$\\text{Index Bits} = \\log_2(\\text{Number of Sets}) = \\log_2(512) = 9\\text{ bits}$$
   *(Identifies which of the 512 sets the memory block maps to).*

3. **Tag Bits**:
   $$\\text{Tag Bits} = 32 - (\\text{Index Bits} + \\text{Offset Bits}) = 32 - (9 + 5) = 32 - 14 = 18\\text{ bits}$$

**Summary Address Map**:
- **Tag**: 18 bits (Bits 31 down to 14)
- **Set Index**: 9 bits (Bits 13 down to 5)
- **Byte Offset**: 5 bits (Bits 4 down to 0)

---

### Step (iii): Total Number of Tag Bits Stored [6 Marks]
- Each cache line has an associated 18-bit tag directory entry.
- Total lines in the cache = $2,048$.
$$\\text{Total Tag Memory} = 2,048\\text{ lines} \\times 18\\text{ bits/line} = 36,864\\text{ bits} = 4.608\\text{ KB}$$

💡 **Examiner's Marking Tip**: University markers often deduct marks if you divide total cache bytes by set count without accounting for block size! Always state line count first.`,
          timestamp: '2026-10-08T09:00:15Z',
          citations: [
            {
              chunkId: 'chunk-2-1',
              docName: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
              docType: 'past_question',
              courseCode: 'CPE401',
              chunkIndex: 0,
              text: 'Question 1 [15 Marks]: A 32-bit microprocessor has a 64 KB, 4-way set-associative cache with 32-byte block size. Determine: (i) Number of sets: 512 sets. (ii) Tag: 18 bits, Index: 9 bits, Offset: 5 bits. (iii) Total tag storage: 36,864 bits.',
              similarity: 0.94,
            },
            {
              chunkId: 'chunk-1-3',
              docName: 'CPE 401 - Module 3: Memory Hierarchy & Cache Mapping Architecture.pdf',
              docType: 'lecture_note',
              courseCode: 'CPE401',
              chunkIndex: 2,
              text: 'Set-Associative Mapping (k-way): Cache is partitioned into sets of k lines. Set Number = (Block Address) MOD (Number of Sets). Sets = Total Lines / k.',
              similarity: 0.88,
            },
          ],
        },
      ],
    },
    {
      id: 'session-2',
      title: 'Pipelining Hazards & Forwarding Logic',
      courseCode: 'CPE401',
      createdAt: '2026-10-07T16:20:00Z',
      messages: [
        {
          id: 'msg-s2-1',
          role: 'user',
          content: 'Explain how operand forwarding prevents pipeline stalls for RAW data hazards.',
          timestamp: '2026-10-07T16:20:05Z',
        },
        {
          id: 'msg-s2-2',
          role: 'assistant',
          content: `In a 5-stage classic RISC pipeline (IF $\\rightarrow$ ID $\\rightarrow$ EX $\\rightarrow$ MEM $\\rightarrow$ WB), a **Read After Write (RAW)** hazard occurs when an instruction requires the result of a preceding instruction that has computed its value in the ALU (EX stage), but has not yet written it back to the register file (WB stage).

### The Solution: Operand Forwarding (Bypassing)
Instead of stalling the pipeline for 2 clock cycles (inserting NOPs):
1. **The Forwarding Unit** monitors the source register numbers in the ID/EX pipeline latch and compares them against the destination register numbers in the EX/MEM and MEM/WB latches.
2. If a match is detected (meaning instruction $i+1$ reads register $R_d$ of instruction $i$), multiplexers at the input of the ALU redirect the result directly from the output of the EX/MEM pipeline register into the ALU operand buffer.
3. As a result, the next instruction executes with zero stall cycles!

*Reference: CPE 401 Exam 2023 Question 2(b) [5 Marks].*`,
          timestamp: '2026-10-07T16:20:18Z',
          citations: [
            {
              chunkId: 'chunk-2-2',
              docName: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
              docType: 'past_question',
              courseCode: 'CPE401',
              chunkIndex: 1,
              text: 'Question 2 [15 Marks]: Pipelining Hazards: Forwarding resolves RAW hazards by routing output of ALU (EX/MEM buffer) directly back to ALU input without waiting for memory or register write-back.',
              similarity: 0.92,
            },
          ],
        },
      ],
    },
  ]);

  const [currentSessionId, setCurrentSessionId] = useState<string>('session-1');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isPlayingAudioMsgId, setIsPlayingAudioMsgId] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<boolean>(true);
  const [strictRAG, setStrictRAG] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Study Consultation',
      courseCode: 'CPE401',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `Hello ${student.name}! I am your **EduRAG AI Study Partner**. 

I have indexed your **${allChunks.length} document chunks** across lecture notes, continuous assessment tests, and past exam question papers.

You can ask me to:
- Solve any specific question from your uploaded past papers step-by-step
- Explain complex engineering formulas and computer architecture diagrams
- Break down high-yield topics likely to appear in your upcoming exam
- Quiz you on test questions and examine your understanding

What topic or question are we tackling right now?`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Update session title if first user query
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length <= 1) {
      updatedTitle = text.slice(0, 36) + (text.length > 36 ? '...' : '');
    }

    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: updatedTitle, messages: updatedMessages }
          : s
      )
    );

    setInputMessage('');
    setIsLoading(true);

    try {
      // 1. RAG Retrieval Step: Find Top-K relevant chunks from vector embeddings
      const retrievedCitations = RAGEngine.retrieveTopKChunks(text, allChunks, 4, 0.12);

      // 2. Call server-side API with retrieved context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          retrievedChunks: retrievedCitations,
          studentProfile: {
            name: student.name,
            level: student.level,
            department: student.department,
            targetExamDate: student.targetExamDate,
          },
          examFocus: examMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toISOString(),
        citations: retrievedCitations.length > 0 ? retrievedCitations : undefined,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, assistantMessage] }
            : s
        )
      );

      // Track study activity
      if (onRecordStudyActivity) {
        onRecordStudyActivity(5); // 5 mins engagement per query
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback message
      const fallbackMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `I retrieved ${allChunks.length} chunks from your uploaded materials, but encountered a temporary connection issue. Please verify your network or try again shortly.`,
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, fallbackMessage] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handlePlayTTS = async (msgId: string, text: string) => {
    if (isPlayingAudioMsgId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudioMsgId(null);
      return;
    }

    try {
      setIsPlayingAudioMsgId(msgId);
      // Strip markdown symbols for clean spoken narration
      const cleanNarration = text
        .replace(/[#*`_$\\]/g, '')
        .replace(/\n+/g, ' ')
        .slice(0, 700);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanNarration, voiceName: 'Kore' }),
      });

      if (!res.ok) throw new Error('TTS request failed');
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          setIsPlayingAudioMsgId(null);
          audioRef.current = null;
        };
      } else {
        setIsPlayingAudioMsgId(null);
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlayingAudioMsgId(null);
    }
  };

  const quickPrompts = [
    { label: 'Solve 2023 Exam Q1', query: 'Can you solve Question 1 from the 2023 past exam paper step by step?' },
    { label: 'Direct vs Set-Associative', query: 'Compare Direct Mapped vs 4-Way Set Associative Cache mapping with formulas.' },
    { label: "Booth's Algorithm Rules", query: "Explain Booth's multiplication algorithm and illustrate with a 4-bit example." },
    { label: 'Pipeline Hazards & Bypass', query: 'What are RAW data hazards in 5-stage pipelining and how does forwarding fix them?' },
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar: Study Sessions & RAG Settings */}
      <aside className="w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col hidden md:flex">
        {/* New Session Button */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={handleCreateNewSession}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            Recent Consultations
          </div>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setCurrentSessionId(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-start space-x-2.5 group ${
                session.id === currentSessionId
                  ? 'bg-slate-800 text-white font-medium border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
              <div className="flex-1 truncate">
                <div className="truncate">{session.title}</div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                  <span className="font-mono text-indigo-300">{session.courseCode}</span>
                  <span>•</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* RAG & Exam Configuration Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2.5 text-xs">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>RAG Grounding Controls</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer">
            <div>
              <div className="font-medium text-slate-200">Exam-Oriented Mode</div>
              <div className="text-[10px] text-slate-400">Include marking schemes & pitfalls</div>
            </div>
            <input
              type="checkbox"
              checked={examMode}
              onChange={(e) => setExamMode(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300">
            <div className="flex items-center space-x-1.5 font-medium mb-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Active Knowledge Base</span>
            </div>
            <div>Indexed <strong>{allChunks.length}</strong> vector chunks from Lecture Notes & Past Papers.</div>
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentSession.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex space-x-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 ring-1 ring-white/10 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed max-w-[85%] sm:max-w-[78%] transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Message Content with Markdown Formatting */}
                  <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* RAG Source Citations Badges */}
                  {!isUser && message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Retrieved RAG Sources (pgvector Cosine Match):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.citations.map((citation, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedCitation(citation)}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs transition-all hover:border-indigo-500/50"
                          >
                            <span className="font-mono text-indigo-400 font-bold">[{idx + 1}]</span>
                            <span className="truncate max-w-[160px] sm:max-w-[200px]">
                              {citation.docName.replace('.pdf', '').replace('.docx', '')}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px]">
                              {Math.round(citation.similarity * 100)}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Message Actions (TTS, Copy, Quiz Launcher) */}
                  {!isUser && (
                    <div className="flex items-center justify-between mt-3 pt-2 text-slate-400 text-xs border-t border-slate-800/60">
                      <div className="flex items-center space-x-2">
                        {/* Audio TTS */}
                        <button
                          onClick={() => handlePlayTTS(message.id, message.content)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors ${
                            isPlayingAudioMsgId === message.id ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
                          }`}
                          title="Listen with Gemini Flash Lite TTS"
                        >
                          {isPlayingAudioMsgId === message.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                              <span className="text-[11px]">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Listen</span>
                            </>
                          )}
                        </button>

                        {/* Copy text */}
                        <button
                          onClick={() => handleCopyText(message.id, message.content)}
                          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy Answer"
                        >
                          {copiedMsgId === message.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quiz me on this button */}
                      {onLaunchQuizTopic && (
                        <button
                          onClick={() => onLaunchQuizTopic('Memory Hierarchy & Cache Calculations')}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-[11px] font-medium transition-all"
                        >
                          <FileQuestion className="w-3 h-3 text-indigo-400" />
                          <span>Drill Me on This</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex space-x-3 max-w-4xl mx-auto justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Searching pgvector knowledge base & synthesizing solution with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Prompt Suggestions */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Quick Prompt Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap text-[11px] flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Suggested:</span>
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs whitespace-nowrap transition-all hover:text-white hover:border-indigo-500/40"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any question from your lecture notes, past exams, or engineering concepts..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all pr-10"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Grounding: Gemini 3.8 Flash • PostgreSQL 16 pgvector • Cosine Similarity</span>
              <span>Computer Engineering Capstone</span>
            </div>
          </div>
        </div>
      </main>

      {/* RAG Citation Inspector Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">
                    {selectedCitation.docName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Chunk #{selectedCitation.chunkIndex} • {selectedCitation.docType.toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
                {Math.round(selectedCitation.similarity * 100)}% Cosine Match
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-60 overflow-y-auto mb-4">
              {selectedCitation.text}
            </div>

            <div className="text-[11px] text-slate-400 mb-4">
              <strong>Vector Distance Metric:</strong> 1 - cosine_distance(q, chunk) retrieved via HNSW vector index in PostgreSQL.
            </div>

            <button
              onClick={() => setSelectedCitation(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Close Citation Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
