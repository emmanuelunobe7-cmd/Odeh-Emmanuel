import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Cpu, 
  Layers, 
  GitBranch, 
  CheckCircle2, 
  Calculator,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { RAGEngine } from '../utils/ragEngine';

export const CapstoneHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [copied, setCopied] = useState<boolean>(false);

  // Vector Cosine Playground State
  const [testSentenceA, setTestSentenceA] = useState('Cache memory mapping direct vs set associative');
  const [testSentenceB, setTestSentenceB] = useState('Partitioning 32-bit address into tag, index, and offset');

  const vecA = RAGEngine.generateDeterministicVector(testSentenceA, 16);
  const vecB = RAGEngine.generateDeterministicVector(testSentenceB, 16);
  const similarityScore = RAGEngine.cosineSimilarity(vecA, vecB);
  const cosineDistance = 1.0 - similarityScore;

  const projectFiles: { [filename: string]: { language: string; description: string; content: string } } = {
    'main.py': {
      language: 'python',
      description: 'FastAPI application with endpoints for document upload, RAG chat, and study frequency examination.',
      content: `from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from .database import get_db
from .models import StudyActivityLog
from .rag_service import RAGService

app = FastAPI(
    title="EduRAG AI - Academic RAG & Personalized Learning API",
    description="Undergraduate Final Project in Computer Engineering: FastAPI + PostgreSQL + pgvector + Gemini API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()

class ChatRequest(BaseModel):
    query: str
    student_id: str
    course_code: Optional[str] = None
    exam_focus: Optional[bool] = True

@app.post("/api/upload")
async def upload_material(
    file: UploadFile = File(...),
    student_id: str = Form(...),
    doc_type: str = Form(...),
    course_code: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """Uploads, cleans, chunks, and embeds student materials into pgvector"""
    content = await file.read()
    raw_text = content.decode("utf-8", errors="ignore")

    result = await rag_service.ingest_document(
        db=db,
        student_id=student_id,
        title=file.filename,
        raw_text=raw_text,
        doc_type=doc_type,
        course_code=course_code
    )
    return {"status": "success", "data": result}

@app.post("/api/chat")
async def chat_rag(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """ChatGPT-like endpoint with RAG context retrieval and citations"""
    response = await rag_service.answer_student_query(
        db=db,
        query=req.query,
        student_id=req.student_id
    )

    # Log study activity for frequency & progress examination
    log = StudyActivityLog(
        student_id=req.student_id,
        activity_type="chat_query",
        duration_seconds=90,
        topic_studied=req.course_code or "General Engineering"
    )
    db.add(log)
    await db.commit()

    return response`,
    },
    'schema.sql': {
      language: 'sql',
      description: 'PostgreSQL database DDL with pgvector extension, HNSW vector index, and Cosine similarity search function.',
      content: `-- =========================================================================
-- EduRAG AI: Personalized Student Learning & Exam Preparation System
-- PostgreSQL Database Schema with pgvector Extension
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Uploaded Educational Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'lecture_note', 'past_question', 'test_question'
    course_code VARCHAR(50) NOT NULL,
    cleaned_content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Document Chunks with Vector Embeddings (768-dim)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    token_length INT NOT NULL,
    embedding vector(768), -- pgvector vector column
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HNSW (Hierarchical Navigable Small World) Index for High-Performance ANN Search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Cosine Similarity Matching Stored Function
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_student_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    doc_title VARCHAR(255),
    chunk_text TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        d.title AS doc_title,
        dc.chunk_text,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE (filter_student_id IS NULL OR d.student_id = filter_student_id)
      AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;`,
    },
    'rag_service.py': {
      language: 'python',
      description: 'RAG Service: vector embedding generation via Google GenAI SDK, pgvector cosine search, and Gemini LLM inference.',
      content: `import os
from typing import List, Dict, Any
from google import genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import DocumentChunk, Document
from .data_cleaner import EducationalDataCleaner

class RAGService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.ai = genai.Client(api_key=api_key)
        self.embedding_model = "gemini-embedding-2-preview"
        self.llm_model = "gemini-3.8-flash"

    async def generate_embedding(self, text: str) -> List[float]:
        """Generates 768-dimensional vector embedding using Google GenAI"""
        response = self.ai.models.embed_content(
            model=self.embedding_model,
            contents=text
        )
        return response.embedding.values

    async def retrieve_relevant_chunks(
        self,
        db: AsyncSession,
        query: str,
        student_id: str,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """Embeds query and queries pgvector using cosine distance (<=> operator)"""
        query_vector = await self.generate_embedding(query)

        stmt = (
            select(
                DocumentChunk,
                Document.title.label("doc_title"),
                DocumentChunk.embedding.cosine_distance(query_vector).label("distance")
            )
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.student_id == student_id)
            .order_by("distance")
            .limit(top_k)
        )

        result = await db.execute(stmt)
        rows = result.all()

        return [
            {
                "chunk_id": str(chunk.id),
                "doc_title": doc_title,
                "text": chunk.chunk_text,
                "similarity": round(1.0 - float(distance), 4)
            }
            for chunk, doc_title, distance in rows
        ]`,
    },
    'data_cleaner.py': {
      language: 'python',
      description: 'Educational text cleaner: unicode normalization, OCR noise filtering, and recursive overlapping chunking.',
      content: `import re
import unicodedata
from typing import List, Dict, Any

class EducationalDataCleaner:
    PAGE_NUMBER_REGEX = re.compile(r"Page\\s+\\d+\\s+of\\s+\\d+|^\\s*\\d+\\s*$", re.MULTILINE | re.IGNORECASE)
    WATERMARK_REGEX = re.compile(r"(UNAUTHORISED COPY|CONFIDENTIAL|DRAFT|SCANNED BY CAMSCANNER)", re.IGNORECASE)

    @classmethod
    def clean_text(cls, raw_text: str, doc_type: str = "lecture_note") -> str:
        if not raw_text: return ""
        text = unicodedata.normalize("NFKC", raw_text)
        text = cls.WATERMARK_REGEX.sub("", text)
        text = cls.PAGE_NUMBER_REGEX.sub("", text)

        if doc_type in ["past_question", "test_question"]:
            text = re.sub(r"(?i)\\bquestion\\s*(\\d+)", r"Question \\1", text)
            text = re.sub(r"[\\(\\[]\\s*(\\d+)\\s*marks?[\\)\\]]", r"[\\1 Marks]", text, flags=re.IGNORECASE)

        text = re.sub(r"[ \\t]+", " ", text)
        text = re.sub(r"\\n{3,}", "\\n\\n", text)
        return text.strip()

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> List[Dict[str, Any]]:
        sentences = re.split(r"(?<=[.?!])\\s+", text)
        chunks = []
        current = []
        curr_len = 0
        idx = 0

        for s in sentences:
            if curr_len + len(s) > chunk_size and current:
                chunk_str = " ".join(current).strip()
                chunks.append({"chunk_index": idx, "text": chunk_str})
                idx += 1
                # Overlap logic
                current = [current[-1]]
                curr_len = len(current[-1])
            current.append(s)
            curr_len += len(s)

        if current:
            chunks.append({"chunk_index": idx, "text": " ".join(current).strip()})
        return chunks`,
    },
    'requirements.txt': {
      language: 'text',
      description: 'Python package dependencies for the backend environment.',
      content: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
google-genai>=0.1.1
pgvector>=0.2.5
psycopg2-binary>=2.9.9
asyncpg>=0.29.0
sqlalchemy>=2.0.28
pydantic>=2.6.4
python-dotenv>=1.0.1
numpy>=1.26.4`,
    },
  };

  const currentFileData = projectFiles[selectedFile] || projectFiles['main.py'];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFileData.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Computer Engineering Final Year Project Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            System Architecture & FastAPI + PostgreSQL pgvector Blueprint
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete technical specification and production Python code for your thesis defense, showcasing RAG pipeline data ingestion, HNSW vector indexing, and Gemini API grounding.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadFile}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFile}</span>
          </button>
        </div>
      </div>

      {/* Interactive Vector Cosine Similarity Playground */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Interactive pgvector Cosine Distance Simulator
            </h2>
          </div>
          <span className="font-mono text-xs text-indigo-400">
            Formula: 1 - (A · B) / (||A|| ||B||)
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Test how PostgreSQL's <code className="text-cyan-300 font-mono">&lt;=&gt;</code> cosine distance operator compares the student's query vector against stored lecture note chunks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Student Query Text Vector A:
            </label>
            <input
              type="text"
              value={testSentenceA}
              onChange={(e) => setTestSentenceA(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Stored Document Chunk Text Vector B:
            </label>
            <input
              type="text"
              value={testSentenceB}
              onChange={(e) => setTestSentenceB(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Calculated Metrics Row */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 mr-2">Cosine Similarity:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {(similarityScore * 100).toFixed(2)}%
            </span>
          </div>

          <div>
            <span className="text-slate-500 mr-2">pgvector Distance (&lt;=&gt;):</span>
            <span className="text-cyan-400 font-bold text-sm">
              {cosineDistance.toFixed(4)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 mr-2">RAG Match Classification:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                similarityScore >= 0.7
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : similarityScore >= 0.4
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
              }`}
            >
              {similarityScore >= 0.7 ? 'Strong Academic Match' : similarityScore >= 0.4 ? 'Moderate Context' : 'Low Relevance'}
            </span>
          </div>
        </div>
      </div>

      {/* Code Browser & File Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        {/* File Tabs Toolbar */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center space-x-1">
            {Object.keys(projectFiles).map((filename) => (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedFile === filename
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 pl-4">
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Description */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-400">
          <strong>Purpose:</strong> {currentFileData.description}
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed scrollbar-thin">
          <pre>{currentFileData.content}</pre>
        </div>
      </div>

      {/* Thesis Defense FAQ / Examiner Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Computer Engineering Undergraduate Defense Cheat Sheet</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-semibold text-cyan-300">
              Q: Why choose PostgreSQL with pgvector over cloud vector databases?
            </h3>
            <p className="text-slate-400 text-[11px]">
              PostgreSQL with pgvector allows unified relational data (student profiles, activity logs, learning paths) and high-dimensional embeddings within a single ACID-compliant database. It eliminates cross-database sync latency and costs.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-semibold text-cyan-300">
              Q: How does the RAG pipeline prevent hallucinations in engineering exams?
            </h3>
            <p className="text-slate-400 text-[11px]">
              The system injects Top-K retrieved chunks directly into the Gemini LLM system prompt with strict grounding constraints. If information is not in the student's notes, the model explicitly flags it as external engineering knowledge.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-semibold text-cyan-300">
              Q: How is study frequency examined and measured?
            </h3>
            <p className="text-slate-400 text-[11px]">
              Tool interaction logs record timestamps, session length, and query counts. Memory retention decay is evaluated using Ebbinghaus exponential decay curves R(t) = exp(-t/S) to schedule optimal spaced repetition intervals.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-semibold text-cyan-300">
              Q: What indexing algorithm is used in pgvector?
            </h3>
            <p className="text-slate-400 text-[11px]">
              HNSW (Hierarchical Navigable Small World) index is used (<code className="text-indigo-400">embedding vector_cosine_ops</code>). It achieves sub-millisecond Approximate Nearest Neighbor (ANN) search with higher recall than IVFFlat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
