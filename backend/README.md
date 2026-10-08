# EduRAG AI: Personalized Student Learning & Exam Preparation System
**Department of Computer Engineering — Final Year Capstone Project**

## 1. Project Abstract
EduRAG AI is a Retrieval-Augmented Generation (RAG) learning assistant designed to personalize undergraduate STEM education. The system ingests student course materials (lecture notes, past exam questions, test papers, and syllabi), performs academic data cleaning, segments text into overlapping semantic chunks, embeds them into a 768-dimensional vector space, and stores them in PostgreSQL utilizing the `pgvector` extension.

When a student queries the system, the RAG engine retrieves the Top-K most relevant chunks using Cosine Similarity metrics, constructs a grounded academic context, and synthesizes step-by-step solutions using Google's Gemini LLM (`gemini-3.8-flash`). Furthermore, the system dynamically examines the student's study frequency and mastery metrics to adapt learning paths and forecast exam readiness.

---

## 2. System Architecture & Tech Stack

```
[Student Web Interface] (HTML5, Tailwind CSS, React, TypeScript)
         │
         ▼
[Backend Gateway] (Python 3.10+, FastAPI, AsyncPG, SQLAlchemy)
         │
         ├───► [Data Cleaning & Chunking Engine] (EducationalDataCleaner)
         │
         ├───► [Vector Database] (PostgreSQL 16 + pgvector HNSW Index)
         │           ├── Tables: students, documents, document_chunks
         │           └── Operators: <=> (Cosine Distance), <#> (Inner Product)
         │
         └───► [Google GenAI SDK (Gemini API)]
                     ├── Embeddings: gemini-embedding-2-preview (768-dim)
                     ├── Reasoning & QA: gemini-3.8-flash
                     └── Text-to-Speech: gemini-3.8-flash-lite-tts
```

---

## 3. Mathematical Foundations

### 3.1 Cosine Similarity & Vector Distance
Given a student query embedding vector $\mathbf{q} \in \mathbb{R}^d$ and a stored document chunk embedding $\mathbf{v} \in \mathbb{R}^d$:

$$\text{Cosine Similarity}(\mathbf{q}, \mathbf{v}) = \frac{\mathbf{q} \cdot \mathbf{v}}{\|\mathbf{q}\|_2 \|\mathbf{v}\|_2} = \frac{\sum_{i=1}^d q_i v_i}{\sqrt{\sum_{i=1}^d q_i^2} \sqrt{\sum_{i=1}^d v_i^2}}$$

In PostgreSQL with `pgvector`, the cosine distance operator `<=>` evaluates:
$$\text{Cosine Distance}(\mathbf{q}, \mathbf{v}) = 1 - \text{Cosine Similarity}(\mathbf{q}, \mathbf{v})$$

### 3.2 Spaced Repetition & Study Frequency Examination
The student's retention decay is modeled using the Ebbinghaus forgetting curve:
$$R(t) = e^{-\frac{t}{S}}$$
where $R$ is memory retention, $t$ is time elapsed since last tool interaction, and $S$ is memory stability increased by frequent study sessions and successful past question drill attempts.

---

## 4. Setup and Execution

### Step 1: Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables (.env)
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/edurag_db
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Run Database Migrations
```bash
psql -U postgres -d edurag_db -f schema.sql
```

### Step 4: Start FastAPI Server
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Access interactive OpenAPI / Swagger docs at: `http://localhost:8000/docs`.
