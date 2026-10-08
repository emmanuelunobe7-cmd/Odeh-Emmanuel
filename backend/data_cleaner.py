"""
EduRAG AI: Data Cleaning, Preprocessing & Text Chunking Engine
Undergraduate Computer Engineering Final Project
Author: Emmanuel Unobe & Team
"""

import re
import unicodedata
from typing import List, Dict, Any

class EducationalDataCleaner:
    """
    Cleans raw educational texts (Lecture Notes, Past Questions, Test Papers, Syllabi)
    Handles noise removal, OCR error correction, header/footer normalization, 
    and recursive semantic chunking with overlap.
    """

    # Common noise patterns in university scanned notes & PDF exports
    PAGE_NUMBER_REGEX = re.compile(r"Page\s+\d+\s+of\s+\d+|^\s*\d+\s*$", re.MULTILINE | re.IGNORECASE)
    WATERMARK_REGEX = re.compile(r"(UNAUTHORISED COPY|CONFIDENTIAL|DRAFT|SCANNED BY CAMSCANNER)", re.IGNORECASE)
    MULTIPLE_SPACES_REGEX = re.compile(r"[ \t]+")
    MULTIPLE_NEWLINES_REGEX = re.compile(r"\n{3,}")

    @classmethod
    def clean_text(cls, raw_text: str, doc_type: str = "lecture_note") -> str:
        """
        Main data cleaning pipeline.
        - Unicode normalization
        - Stripping unwanted watermarks & header artifacts
        - Normalizing question numbering (e.g. '1(a)', 'Q1.', 'Question 1:')
        - Removing irregular whitespace
        """
        if not raw_text:
            return ""

        # 1. Normalize Unicode (NFKC)
        text = unicodedata.normalize("NFKC", raw_text)

        # 2. Remove common OCR / PDF watermarks and artifacts
        text = cls.WATERMARK_REGEX.sub("", text)
        text = cls.PAGE_NUMBER_REGEX.sub("", text)

        # 3. Clean past questions formatting if doc_type is past_question or test_question
        if doc_type in ["past_question", "test_question"]:
            # Standardize 'Question 1', 'Q1', '1a' to clean searchable format
            text = re.sub(r"(?i)\bquestion\s*(\d+)", r"Question \1", text)
            text = re.sub(r"(?i)\bq(\d+)\b", r"Question \1", text)
            # Standardize mark allocations e.g. '[15 marks]' or '(10 Marks)'
            text = re.sub(r"[\(\[]\s*(\d+)\s*marks?\s*[\)\]]", r"[\1 Marks]", text, flags=re.IGNORECASE)

        # 4. Collapse irregular whitespace
        text = cls.MULTIPLE_SPACES_REGEX.sub(" ", text)
        text = cls.MULTIPLE_NEWLINES_REGEX.sub("\n\n", text)

        return text.strip()

    @classmethod
    def chunk_text(
        cls, 
        cleaned_text: str, 
        chunk_size: int = 500, 
        chunk_overlap: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Splits cleaned text into overlapping chunks suitable for pgvector embeddings.
        Preserves sentence boundaries where possible.
        """
        if not cleaned_text:
            return []

        # Split into paragraphs or sentences first
        sentences = re.split(r"(?<=[.?!])\s+", cleaned_text)
        chunks: List[Dict[str, Any]] = []
        current_chunk: List[str] = []
        current_length = 0
        chunk_index = 0

        for sentence in sentences:
            sentence_length = len(sentence)
            if current_length + sentence_length > chunk_size and current_chunk:
                # Store finished chunk
                chunk_str = " ".join(current_chunk).strip()
                chunks.append({
                    "chunk_index": chunk_index,
                    "text": chunk_str,
                    "token_length": len(chunk_str.split()),
                })
                chunk_index += 1

                # Keep overlap from the end
                overlap_text: List[str] = []
                overlap_len = 0
                for s in reversed(current_chunk):
                    if overlap_len + len(s) <= chunk_overlap:
                        overlap_text.insert(0, s)
                        overlap_len += len(s)
                    else:
                        break
                current_chunk = overlap_text
                current_length = overlap_len

            current_chunk.append(sentence)
            current_length += sentence_length

        # Final lingering chunk
        if current_chunk:
            chunk_str = " ".join(current_chunk).strip()
            chunks.append({
                "chunk_index": chunk_index,
                "text": chunk_str,
                "token_length": len(chunk_str.split()),
            })

        return chunks
