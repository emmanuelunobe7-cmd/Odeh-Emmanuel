"""
EduRAG AI: Retrieval-Augmented Generation (RAG) Service
Integrates Google GenAI SDK (Gemini API) and pgvector for semantic search.
"""

import os
from typing import List, Dict, Any
from google import genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import DocumentChunk, Document
from .data_cleaner import EducationalDataCleaner

class RAGService:
    def __init__(self):
        # Initialize Google GenAI client
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

    async def ingest_document(
        self,
        db: AsyncSession,
        student_id: str,
        title: str,
        raw_text: str,
        doc_type: str,
        course_code: str
    ) -> Dict[str, Any]:
        """
        Cleans, chunks, embeds, and stores documents in PostgreSQL with pgvector.
        """
        # 1. Clean data using academic cleaner
        clean_text = EducationalDataCleaner.clean_text(raw_text, doc_type)

        # 2. Split into overlapping chunks
        chunks_data = EducationalDataCleaner.chunk_text(clean_text, chunk_size=500, chunk_overlap=100)

        # 3. Create parent document
        doc = Document(
            student_id=student_id,
            title=title,
            doc_type=doc_type,
            course_code=course_code,
            raw_content=raw_text,
            cleaned_content=clean_text,
            token_count=len(clean_text.split())
        )
        db.add(doc)
        await db.flush()

        # 4. Generate embeddings and store chunks
        chunk_objects = []
        for c in chunks_data:
            embedding = await self.generate_embedding(c["text"])
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                chunk_text=c["text"],
                token_length=c["token_length"],
                embedding=embedding,
                chunk_metadata={"doc_type": doc_type, "course_code": course_code}
            )
            chunk_objects.append(chunk_obj)

        db.add_all(chunk_objects)
        await db.commit()

        return {
            "document_id": str(doc.id),
            "chunks_stored": len(chunk_objects),
            "clean_tokens": doc.token_count
        }

    async def retrieve_relevant_chunks(
        self,
        db: AsyncSession,
        query: str,
        student_id: str,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Embeds the student query and searches pgvector using cosine distance (<=> operator)
        """
        query_vector = await self.generate_embedding(query)

        # Query pgvector for Top-K nearest neighbors
        stmt = (
            select(
                DocumentChunk,
                Document.title.label("doc_title"),
                Document.doc_type,
                DocumentChunk.embedding.cosine_distance(query_vector).label("distance")
            )
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(Document.student_id == student_id)
            .order_by("distance")
            .limit(top_k)
        )

        result = await db.execute(stmt)
        rows = result.all()

        retrieved = []
        for chunk, doc_title, doc_type, distance in rows:
            similarity = 1.0 - float(distance) if distance is not None else 0.0
            retrieved.append({
                "chunk_id": str(chunk.id),
                "doc_title": doc_title,
                "doc_type": doc_type,
                "chunk_index": chunk.chunk_index,
                "text": chunk.chunk_text,
                "similarity": round(similarity, 4)
            })

        return retrieved

    async def answer_student_query(
        self,
        db: AsyncSession,
        query: str,
        student_id: str,
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Executes RAG pipeline: retrieves chunks from pgvector and prompts Gemini LLM
        """
        # Step 1: Retrieve context
        chunks = await self.retrieve_relevant_chunks(db, query, student_id, top_k=4)

        # Step 2: Build Grounded Context
        context_str = "\n\n".join([
            f"[Source: {c['doc_title']} ({c['doc_type']}) - Chunk #{c['chunk_index']} - Relevance: {int(c['similarity']*100)}%]\n{c['text']}"
            for c in chunks
        ])

        system_instruction = (
            "You are EduRAG AI, a personalized computer engineering tutor.\n"
            "Ground your answer in the provided academic documents and past questions.\n"
            "Always cite sources [Source: Document, Chunk #X] where applicable.\n"
            "Provide step-by-step mathematical reasoning and exam pointers.\n\n"
            f"RETRIEVED COURSE MATERIAL:\n{context_str}"
        )

        # Step 3: Call Gemini LLM
        response = self.ai.models.generate_content(
            model=self.llm_model,
            contents=query,
            config={"system_instruction": system_instruction}
        )

        return {
            "answer": response.text,
            "citations": chunks
        }
