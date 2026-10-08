-- =========================================================================
-- EduRAG AI: Personalized Student Learning & Exam Mastery Platform
-- Undergraduate Final Year Project: Computer Engineering Department
-- PostgreSQL Database Schema with pgvector Extension
-- =========================================================================

-- 1. Enable the pgvector extension for high-dimensional vector search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Students & User Profile Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    matric_number VARCHAR(50) UNIQUE,
    department VARCHAR(100) DEFAULT 'Computer Engineering',
    current_level VARCHAR(20) DEFAULT 'Undergraduate', -- 100L, 200L, 300L, 400L, 500L
    study_streak_days INT DEFAULT 0,
    total_study_minutes INT DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Uploaded Educational Documents (Lecture Notes, Past Questions, Test Papers)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'lecture_note', 'past_question', 'test_question', 'syllabus', 'lab_manual'
    course_code VARCHAR(50) NOT NULL, -- e.g., 'CPE401', 'CPE503'
    academic_year VARCHAR(20),        -- e.g., '2023/2024'
    raw_content TEXT NOT NULL,
    cleaned_content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Document Chunks with Vector Embeddings (RAG Ingestion)
-- Using 768 dimensions (gemini-embedding-2-preview)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    token_length INT NOT NULL,
    embedding vector(768), -- pgvector vector column
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g., {"topic": "Pipelining", "is_past_question": true, "question_number": "Q3"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create HNSW (Hierarchical Navigable Small World) Index for Fast Approximate Nearest Neighbor (ANN) Cosine Search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 6. Personalized Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    target_exam_date DATE,
    daily_target_minutes INT DEFAULT 120,
    completion_percentage NUMERIC(5,2) DEFAULT 0.00,
    exam_readiness_score INT DEFAULT 0, -- 0-100%
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'revised'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Learning Path Modules & Topics
CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    module_title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_hours NUMERIC(4,1) DEFAULT 3.0,
    exam_frequency_weight VARCHAR(50), -- 'High Yield (Appeared in 80% past exams)', 'Medium', 'Foundational'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'mastered'
    key_topics JSONB DEFAULT '[]'::jsonb,
    milestone_task TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Student Tool Usage & Frequency Examination
-- Tracks how frequently the student studies to examine engagement and retention
CREATE TABLE IF NOT EXISTS study_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity_type VARCHAR(50) NOT NULL, -- 'chat_query', 'rag_retrieval', 'quiz_drill', 'note_review'
    duration_seconds INT DEFAULT 0,
    interaction_count INT DEFAULT 1,
    topic_studied VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Past Question Drills & Quiz Performance Records
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    identified_weak_areas JSONB DEFAULT '[]'::jsonb,
    time_taken_seconds INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PostgreSQL Stored Function for Semantic Cosine Search (RAG Retrieval)
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_student_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    doc_title VARCHAR(255),
    doc_type VARCHAR(50),
    course_code VARCHAR(50),
    chunk_index INT,
    chunk_text TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        d.title AS doc_title,
        d.doc_type,
        d.course_code,
        dc.chunk_index,
        dc.chunk_text,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE (filter_student_id IS NULL OR d.student_id = filter_student_id)
      AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
