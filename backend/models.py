"""
EduRAG AI: SQLAlchemy ORM Models with pgvector Support
Undergraduate Final Year Project: Computer Engineering
"""

import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, DateTime, Date, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    matric_number = Column(String(50), unique=True)
    department = Column(String(100), default="Computer Engineering")
    current_level = Column(String(20), default="Undergraduate")
    study_streak_days = Column(Integer, default=0)
    total_study_minutes = Column(Integer, default=0)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="student", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="student", cascade="all, delete-orphan")
    activity_logs = relationship("StudyActivityLog", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False) # 'lecture_note', 'past_question', 'test_question', 'syllabus'
    course_code = Column(String(50), nullable=False)
    academic_year = Column(String(20))
    raw_content = Column(Text, nullable=False)
    cleaned_content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    token_length = Column(Integer, nullable=False)
    embedding = Column(Vector(768)) # pgvector 768-dimensional vector
    chunk_metadata = Column("metadata", JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    course_code = Column(String(50), nullable=False)
    course_title = Column(String(255), nullable=False)
    target_exam_date = Column(Date)
    daily_target_minutes = Column(Integer, default=120)
    completion_percentage = Column(Numeric(5, 2), default=0.0)
    exam_readiness_score = Column(Integer, default=0)
    status = Column(String(50), default="in_progress")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="learning_paths")
    modules = relationship("LearningModule", back_populates="learning_path", cascade="all, delete-orphan")


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_path_id = Column(UUID(as_uuid=True), ForeignKey("learning_paths.id", ondelete="CASCADE"))
    week_number = Column(Integer, nullable=False)
    module_title = Column(String(255), nullable=False)
    description = Column(Text)
    estimated_hours = Column(Numeric(4, 1), default=3.0)
    exam_frequency_weight = Column(String(50))
    status = Column(String(50), default="pending")
    key_topics = Column(JSON, default=[])
    milestone_task = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    learning_path = relationship("LearningPath", back_populates="modules")


class StudyActivityLog(Base):
    __tablename__ = "study_activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    session_date = Column(Date, default=date.today)
    activity_type = Column(String(50), nullable=False)
    duration_seconds = Column(Integer, default=0)
    interaction_count = Column(Integer, default=1)
    topic_studied = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="activity_logs")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"))
    topic = Column(String(255), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    score_percentage = Column(Numeric(5, 2), nullable=False)
    identified_weak_areas = Column(JSON, default=[])
    time_taken_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="quiz_attempts")
