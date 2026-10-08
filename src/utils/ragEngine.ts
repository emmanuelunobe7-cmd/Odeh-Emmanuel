import { DocumentChunk, Citation, DocType } from '../types';

export class RAGEngine {
  /**
   * Cleans raw text from lecture notes, past questions, or test questions.
   */
  static cleanText(rawText: string, docType: DocType): string {
    if (!rawText) return '';
    let text = rawText;
    // Remove unwanted page markers, watermarks
    text = text.replace(/Page\s+\d+\s+of\s+\d+/gi, '');
    text = text.replace(/Confidential|Unauthorized Copy|Scanned by CamScanner/gi, '');

    // Standardize Question numbering
    if (docType === 'past_question' || docType === 'test_question') {
      text = text.replace(/\bquestion\s*(\d+)/gi, 'Question $1');
      text = text.replace(/\[\s*(\d+)\s*marks?\]/gi, '[$1 Marks]');
    }

    // Collapse whitespace
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }

  /**
   * Breaks cleaned text into overlapping chunks
   */
  static chunkText(
    text: string,
    docId: string,
    docName: string,
    docType: DocType,
    courseCode: string,
    chunkSize = 380,
    overlap = 80
  ): DocumentChunk[] {
    if (!text) return [];

    const sentences = text.match(/[^.!?]+[.!?]+|\S+/g) || [text];
    const chunks: DocumentChunk[] = [];
    let currentChunkParts: string[] = [];
    let currentLength = 0;
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;
      if (currentLength + sentenceLength > chunkSize && currentChunkParts.length > 0) {
        const chunkText = currentChunkParts.join(' ').trim();
        chunks.push({
          id: `${docId}-chunk-${chunkIndex}`,
          documentId: docId,
          docName,
          docType,
          courseCode,
          chunkIndex,
          text: chunkText,
          tokenLength: chunkText.split(/\s+/).length,
          embedding: this.generateDeterministicVector(chunkText),
        });
        chunkIndex++;

        // Keep overlap
        const overlapParts: string[] = [];
        let overlapLen = 0;
        for (let i = currentChunkParts.length - 1; i >= 0; i--) {
          if (overlapLen + currentChunkParts[i].length <= overlap) {
            overlapParts.unshift(currentChunkParts[i]);
            overlapLen += currentChunkParts[i].length;
          } else {
            break;
          }
        }
        currentChunkParts = overlapParts;
        currentLength = overlapLen;
      }

      currentChunkParts.push(sentence.trim());
      currentLength += sentenceLength;
    }

    if (currentChunkParts.length > 0) {
      const chunkText = currentChunkParts.join(' ').trim();
      chunks.push({
        id: `${docId}-chunk-${chunkIndex}`,
        documentId: docId,
        docName,
        docType,
        courseCode,
        chunkIndex,
        text: chunkText,
        tokenLength: chunkText.split(/\s+/).length,
        embedding: this.generateDeterministicVector(chunkText),
      });
    }

    return chunks;
  }

  /**
   * Calculates Cosine Similarity between two numeric vectors
   * Range: 0.0 to 1.0 (or -1.0 to 1.0)
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a deterministic high-dimensional vector for local fast similarity
   */
  static generateDeterministicVector(text: string, dimensions = 64): number[] {
    const vector = new Array(dimensions).fill(0);
    const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

    tokens.forEach((token) => {
      if (token.length < 2) return;
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1;
    });

    // Normalize to unit vector
    const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0)) || 1;
    return vector.map((v) => Number((v / magnitude).toFixed(5)));
  }

  /**
   * Retrieves Top-K most relevant chunks from the student's loaded document chunks
   */
  static retrieveTopKChunks(
    query: string,
    allChunks: DocumentChunk[],
    topK = 4,
    threshold = 0.15
  ): Citation[] {
    if (!query || allChunks.length === 0) return [];

    const queryVec = this.generateDeterministicVector(query);
    const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);

    const scored = allChunks.map((chunk) => {
      const chunkVec = chunk.embedding || this.generateDeterministicVector(chunk.text);
      const vectorScore = this.cosineSimilarity(queryVec, chunkVec);

      // Lexical keyword matching boost for exact acronyms/course terminology (e.g., AMAT, CPI, Booth, RAW, L1/L2)
      let keywordMatches = 0;
      const lowerChunk = chunk.text.toLowerCase();
      queryTokens.forEach((tok) => {
        if (lowerChunk.includes(tok)) keywordMatches++;
      });
      const lexicalScore = queryTokens.length > 0 ? keywordMatches / queryTokens.length : 0;

      // Hybrid RAG score (70% Vector Cosine + 30% Lexical Term Matching)
      const combinedScore = vectorScore * 0.7 + lexicalScore * 0.3;

      return {
        chunkId: chunk.id,
        docName: chunk.docName,
        docType: chunk.docType,
        courseCode: chunk.courseCode,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        similarity: Math.min(1.0, Math.max(0.0, combinedScore)),
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);

    // Return Top K with threshold filter
    return scored.filter((c) => c.similarity >= threshold).slice(0, topK);
  }
}
