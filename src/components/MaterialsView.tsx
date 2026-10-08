import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FileCode, 
  Plus, 
  Search, 
  BookOpen, 
  FileQuestion,
  Filter,
  Cpu
} from 'lucide-react';
import { DocumentItem, DocType, DocumentChunk } from '../types';
import { RAGEngine } from '../utils/ragEngine';

interface MaterialsViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [activeTab, setActiveTab] = useState<'clean_view' | 'raw_view' | 'chunks_view'>('chunks_view');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // New Document Upload State
  const [newTitle, setNewTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocType>('past_question');
  const [newCourseCode, setNewCourseCode] = useState('CPE401');
  const [newCourseTitle, setNewCourseTitle] = useState('Advanced Computer Architecture');
  const [newContent, setNewContent] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filterType === 'all' || doc.docType === filterType;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const docId = `doc-${Date.now()}`;
    const cleaned = RAGEngine.cleanText(newContent, newDocType);
    const chunks = RAGEngine.chunkText(
      cleaned,
      docId,
      newTitle,
      newDocType,
      newCourseCode,
      380,
      80
    );

    const newDoc: DocumentItem = {
      id: docId,
      title: newTitle,
      docType: newDocType,
      courseCode: newCourseCode,
      courseTitle: newCourseTitle,
      rawContent: newContent,
      cleanedContent: cleaned,
      tokenCount: cleaned.split(/\s+/).length,
      uploadedAt: new Date().toISOString(),
      chunks,
    };

    onAddDocument(newDoc);
    setSelectedDoc(newDoc);
    setIsUploadModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewContent('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewTitle(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setNewContent(text);
    };
    reader.readAsText(file);
  };

  const docTypeBadgeColor: Record<DocType, string> = {
    lecture_note: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    past_question: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    test_question: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    syllabus: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    lab_manual: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>PostgreSQL & pgvector Ingestion Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Student Academic Knowledge Base
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload lecture notes, university past question papers, and test problems. The engine cleans text, performs recursive chunking, and indexes vectors for RAG retrieval.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Learning Material</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents Browser */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Loaded Documents ({filteredDocs.length})</span>
            </h2>
            <div className="text-xs text-slate-400">
              Total Chunks: <strong>{documents.reduce((acc, d) => acc + d.chunks.length, 0)}</strong>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search materials by title or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'all' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('lecture_note')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'lecture_note' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lecture Notes
              </button>
              <button
                onClick={() => setFilterType('past_question')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'past_question' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Past Questions
              </button>
              <button
                onClick={() => setFilterType('test_question')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'test_question' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Test Questions
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <FileText className={`w-4 h-4 mt-1 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div>
                        <h3 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
                          {doc.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${docTypeBadgeColor[doc.docType]}`}>
                            {doc.docType.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] font-mono text-indigo-300">
                            {doc.courseCode}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {doc.chunks.length} chunks
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                        if (selectedDoc?.id === doc.id) {
                          setSelectedDoc(documents.find((d) => d.id !== doc.id) || null);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Document Inspection & pgvector Chunk Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
          {selectedDoc ? (
            <>
              {/* Document Header & Tabs */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${docTypeBadgeColor[selectedDoc.docType]}`}>
                      {selectedDoc.docType.replace('_', ' ')}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1">
                      {selectedDoc.title}
                    </h2>
                    <div className="text-xs text-slate-400 flex items-center space-x-3 mt-1">
                      <span>Course: <strong className="text-indigo-300">{selectedDoc.courseCode}</strong></span>
                      <span>•</span>
                      <span>Total Words: <strong>{selectedDoc.tokenCount}</strong></span>
                      <span>•</span>
                      <span>Vector Chunks: <strong>{selectedDoc.chunks.length}</strong></span>
                    </div>
                  </div>

                  {/* View Switcher */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('chunks_view')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeTab === 'chunks_view' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Vector Chunks ({selectedDoc.chunks.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('clean_view')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeTab === 'clean_view' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Cleaned Text
                    </button>
                    <button
                      onClick={() => setActiveTab('raw_view')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeTab === 'raw_view' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Raw Input
                    </button>
                  </div>
                </div>
              </div>

              {/* View Content */}
              <div className="flex-1 overflow-y-auto max-h-[580px] scrollbar-thin">
                {activeTab === 'chunks_view' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>
                          <strong>pgvector Dimension:</strong> 768 float values per chunk. Embeddings generated via Google GenAI.
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-indigo-400">HNSW Indexed</span>
                    </div>

                    {selectedDoc.chunks.map((chunk, index) => (
                      <div
                        key={chunk.id}
                        className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-indigo-400">
                            Chunk #{chunk.chunkIndex} (ID: {chunk.id})
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Length: {chunk.tokenLength} words (~{chunk.tokenLength * 4} chars)
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          {chunk.text}
                        </p>

                        {/* Vector Embedding Preview */}
                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <div className="truncate max-w-[80%]">
                            Embedding: [{chunk.embedding?.slice(0, 5).join(', ')}, ... +763 dimensions]
                          </div>
                          <span className="text-emerald-400 text-[10px]">Ready for Cosine Search</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'clean_view' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedDoc.cleanedContent}
                  </div>
                )}

                {activeTab === 'raw_view' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {selectedDoc.rawContent}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600" />
              <p className="text-sm">Select a document from the left list to inspect its RAG vector chunks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload New Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              Upload Educational Material
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add your lecture notes, past questions, or test questions to the personalized RAG knowledge base.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as DocType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="past_question">Past Question Paper</option>
                    <option value="test_question">Test / CAT Questions</option>
                    <option value="lecture_note">Lecture Note / Handout</option>
                    <option value="syllabus">Course Syllabus</option>
                    <option value="lab_manual">Lab Manual / Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. CPE401, EEE302"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CPE 401 2024 Exam Past Questions Paper"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Upload file button */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Or Load from File (.txt, .md, .pdf, .docx)
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.text,.pdf,.docx"
                  onChange={handleFileSelect}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Content / Questions Text
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                  placeholder="Paste lecture notes or past question paper text here..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Ingest & Generate Vector Chunks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
