import { DocumentItem, LearningPathData, StudyFrequencyMetric } from '../types';

export const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'CPE 401 - Module 3: Memory Hierarchy & Cache Mapping Architecture.pdf',
    docType: 'lecture_note',
    courseCode: 'CPE401',
    courseTitle: 'Advanced Computer Architecture',
    academicYear: '2023/2024',
    rawContent: `DEPARTMENT OF COMPUTER ENGINEERING
COURSE CODE: CPE 401 - ADVANCED COMPUTER ARCHITECTURE
MODULE 3: MEMORY HIERARCHY & CACHE MEMORY DESIGN

1. Introduction to Cache Memory
Due to the processor-memory performance gap, cache memory is placed between the CPU and Main Memory to exploit temporal and spatial locality of reference.
Temporal Locality: If a memory location is referenced once, it will likely be referenced again soon (e.g., loops).
Spatial Locality: If a memory location is referenced, nearby locations will likely be referenced soon (e.g., array traversal, sequential code).

2. Cache Mapping Techniques
There are three fundamental mapping functions:
A. Direct Mapping: Each block of main memory maps to exactly one cache line.
Formula: Line Number = (Block Address) MOD (Number of Lines in Cache)
Address Breakdown (32-bit CPU):
- Tag bits = 32 - (Line index bits + Word offset bits)
- Line index bits = log2(Number of cache lines)
- Byte/Word offset = log2(Block size in bytes)
Advantage: Simple hardware, fastest hit time, low power consumption.
Disadvantage: High conflict misses when two frequently accessed blocks map to the same line (cache thrashing).

B. Fully Associative Mapping: A block can be placed in any cache line.
Address Breakdown:
- Tag bits = 32 - Offset bits
- Word offset = log2(Block size)
Advantage: Eliminates conflict misses.
Disadvantage: Requires parallel comparison across all tags; high hardware cost and power dissipation.

C. Set-Associative Mapping (k-way): Cache is divided into sets, each containing k lines. A block maps to any line within a specific set.
Formula: Set Number = (Block Address) MOD (Number of Sets)
Number of Sets = Total Cache Lines / k.
For example, in a 4-way set associative cache with 1024 lines, there are 1024 / 4 = 256 sets (8 set bits).

3. Performance Metrics
Average Memory Access Time (AMAT):
AMAT = Hit Time + (Miss Rate * Miss Penalty).
For multi-level caches (L1 and L2):
AMAT = Hit Time(L1) + Miss Rate(L1) * [Hit Time(L2) + Miss Rate(L2) * Miss Penalty(L2)].
Example: If L1 hit time is 1 ns, L1 miss rate is 5%, L2 hit time is 4 ns, L2 miss rate is 20%, and main memory access is 100 ns:
AMAT = 1 + 0.05 * [4 + 0.20 * 100] = 1 + 0.05 * [24] = 2.20 ns.`,
    cleanedContent: `DEPARTMENT OF COMPUTER ENGINEERING - CPE 401: MEMORY HIERARCHY & CACHE MEMORY DESIGN
1. Introduction: Cache memory mitigates the processor-memory gap exploiting temporal and spatial locality.
2. Mapping Techniques:
- Direct Mapping: Line = (Block Address) MOD (Lines in Cache). Tag = 32 - (Index + Offset). Prone to conflict misses.
- Fully Associative Mapping: Block maps anywhere. Tag = 32 - Offset. Eliminates conflict misses but expensive.
- Set-Associative Mapping (k-way): Cache divided into sets of k lines. Set = (Block Address) MOD (Number of Sets). Number of Sets = Lines / k.
3. Performance Metrics:
AMAT = Hit Time + (Miss Rate * Miss Penalty).
Multi-level AMAT = Hit Time(L1) + Miss Rate(L1) * [Hit Time(L2) + Miss Rate(L2) * Miss Penalty(L2)].`,
    tokenCount: 420,
    uploadedAt: '2026-09-18T10:15:00Z',
    chunks: [
      {
        id: 'chunk-1-1',
        documentId: 'doc-1',
        docName: 'CPE 401 - Module 3: Memory Hierarchy & Cache Mapping Architecture.pdf',
        docType: 'lecture_note',
        courseCode: 'CPE401',
        chunkIndex: 0,
        text: 'Temporal Locality: If a memory location is referenced once, it will likely be referenced again soon (e.g., loops). Spatial Locality: If a memory location is referenced, nearby locations will likely be referenced soon (e.g., array traversal, sequential code). Cache mitigates the processor-memory bottleneck using these principles.',
        tokenLength: 48,
      },
      {
        id: 'chunk-1-2',
        documentId: 'doc-1',
        docName: 'CPE 401 - Module 3: Memory Hierarchy & Cache Mapping Architecture.pdf',
        docType: 'lecture_note',
        courseCode: 'CPE401',
        chunkIndex: 1,
        text: 'Direct Mapping: Line = (Block Address) MOD (Number of Lines in Cache). Address format: Tag bits = 32 - (Line index bits + Word offset bits). Line index = log2(Lines in cache), Offset = log2(Block size). Advantage: Simple hardware, fastest hit time. Disadvantage: Conflict misses occur when two active blocks map to the same line.',
        tokenLength: 62,
      },
      {
        id: 'chunk-1-3',
        documentId: 'doc-1',
        docName: 'CPE 401 - Module 3: Memory Hierarchy & Cache Mapping Architecture.pdf',
        docType: 'lecture_note',
        courseCode: 'CPE401',
        chunkIndex: 2,
        text: 'Set-Associative Mapping (k-way): Cache is partitioned into sets of k lines. Set Number = (Block Address) MOD (Number of Sets). Sets = Total Lines / k. For example, a 4-way set associative cache with 1024 lines has 256 sets (8 set bits). AMAT formula: AMAT = Hit Time + (Miss Rate * Miss Penalty).',
        tokenLength: 61,
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
    docType: 'past_question',
    courseCode: 'CPE401',
    courseTitle: 'Advanced Computer Architecture',
    academicYear: '2022/2023',
    rawContent: `FACULTY OF ENGINEERING - DEPARTMENT OF COMPUTER ENGINEERING
FIRST SEMESTER EXAMINATION 2022/2023 SESSION
COURSE CODE: CPE 401 - ADVANCED COMPUTER ARCHITECTURE
TIME ALLOWED: 3 HOURS. INSTRUCTIONS: ANSWER ANY 4 QUESTIONS.

Question 1 [15 Marks]:
(a) A 32-bit microprocessor has a 64 KB, 4-way set-associative cache with 32-byte block size.
Determine:
i. The number of sets in the cache [3 Marks]
ii. The bit fields required for Tag, Set Index, and Byte Offset in the physical address [6 Marks]
iii. The total number of tag bits stored in the entire cache memory [6 Marks]

Question 2 [15 Marks]:
(a) Explain the three major types of pipeline hazards: Structural, Data, and Control Hazards. [6 Marks]
(b) Discuss the forwarding (bypassing) technique used in modern RISC pipelining to resolve RAW (Read After Write) data hazards without inserting pipeline stalls (NOPs). [5 Marks]
(c) Given a 5-stage RISC pipeline (IF, ID, EX, MEM, WB) running at 2.5 GHz clock frequency:
If 20% of instructions are conditional branches, and 75% of branches are taken causing a 2-cycle penalty, calculate the effective CPI and pipeline throughput. [4 Marks]

Question 3 [15 Marks]:
(a) State Booth's multiplication algorithm for signed binary 2's complement integers. [5 Marks]
(b) Using Booth's algorithm, perform the multiplication of multiplicand M = -5 (1011 in 4-bit 2's complement) and multiplier Q = +7 (0111). Show all arithmetic shift right (ASR) steps and partial products in tabular format. [10 Marks]`,
    cleanedContent: `UNIVERSITY FINAL EXAM 2023 - CPE 401
Question 1 [15 Marks]: 32-bit CPU, 64 KB 4-way set-associative cache, 32-byte blocks. (i) Number of sets. (ii) Tag, Set Index, Offset bits. (iii) Total tag bits in cache.
Question 2 [15 Marks]: (a) Pipeline hazards: Structural, Data, Control. (b) Operand forwarding in RISC pipelines to eliminate RAW hazards. (c) 5-stage pipeline CPI calculation with branch penalty.
Question 3 [15 Marks]: (a) Booth's multiplication algorithm rules for signed integers. (b) Step-by-step arithmetic multiplication of -5 and +7 showing ASR and tabular state.`,
    tokenCount: 380,
    uploadedAt: '2026-09-20T14:30:00Z',
    chunks: [
      {
        id: 'chunk-2-1',
        documentId: 'doc-2',
        docName: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
        docType: 'past_question',
        courseCode: 'CPE401',
        chunkIndex: 0,
        text: 'Question 1 [15 Marks]: A 32-bit microprocessor has a 64 KB, 4-way set-associative cache with 32-byte block size. Determine: (i) Number of sets: Total cache lines = 64KB / 32B = 2048 lines. Sets = 2048 / 4 = 512 sets. (ii) Bit allocation: Offset = log2(32) = 5 bits. Set Index = log2(512) = 9 bits. Tag = 32 - 9 - 5 = 18 bits. (iii) Total tag storage = 2048 lines * 18 bits = 36,864 bits.',
        tokenLength: 85,
      },
      {
        id: 'chunk-2-2',
        documentId: 'doc-2',
        docName: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
        docType: 'past_question',
        courseCode: 'CPE401',
        chunkIndex: 1,
        text: 'Question 2 [15 Marks]: Pipelining Hazards: Structural hazard (resource conflict), Data hazard (RAW dependency where subsequent instruction needs result before WB stage), Control hazard (branch decisions changing PC). Forwarding resolves RAW hazards by routing output of ALU (EX/MEM buffer) directly back to ALU input without waiting for memory or register write-back.',
        tokenLength: 68,
      },
      {
        id: 'chunk-2-3',
        documentId: 'doc-2',
        docName: 'University Final Examination 2023 - CPE 401 Past Question Paper.pdf',
        docType: 'past_question',
        courseCode: 'CPE401',
        chunkIndex: 2,
        text: "Question 3 [15 Marks]: Booth's Algorithm for signed 2's complement multiplication: Examines least significant bit Q0 and auxiliary bit Q-1. (0,0) or (1,1): Arithmetic Shift Right (ASR) only. (1,0): A = A - M, then ASR. (0,1): A = A + M, then ASR. Preserves sign bit during ASR operations across accumulator [A, Q, Q-1].",
        tokenLength: 72,
      },
    ],
  },
  {
    id: 'doc-3',
    title: 'CPE 401 - Mid-Semester Continuous Assessment Test 1 (2024).docx',
    docType: 'test_question',
    courseCode: 'CPE401',
    courseTitle: 'Advanced Computer Architecture',
    academicYear: '2023/2024',
    rawContent: `CONTINUOUS ASSESSMENT TEST 1 (30 MARKS)
DEPARTMENT OF COMPUTER ENGINEERING - 400 LEVEL
COURSE: CPE 401 - ADVANCED COMPUTER ARCHITECTURE

Question 1 [10 Marks]:
Compare Direct Mapped Cache versus 2-way Set Associative Cache in terms of:
- Hit time latency
- Hardware complexity (multiplexers and comparators)
- Miss rate vulnerability to thrashing

Question 2 [10 Marks]:
A program has 1,000,000 memory instructions. Cache L1 has a miss rate of 4%, and L2 has a local miss rate of 15%.
Determine how many memory requests actually reach the main memory.
Solution outline:
L1 misses = 1,000,000 * 0.04 = 40,000 misses.
These 40,000 misses are forwarded to L2 cache.
Requests reaching Main Memory = 40,000 * 0.15 = 6,000 memory requests.

Question 3 [10 Marks]:
Explain how the write-back policy with dirty bit differs from the write-through policy with write buffer. Which policy generates less traffic on the system bus?`,
    cleanedContent: `CAT 1 (30 MARKS) - CPE 401
Question 1: Direct Mapped vs 2-way Set Associative: Hit time, hardware comparators, thrashing vulnerability.
Question 2: Multi-level cache miss cascade: 1M instructions, L1 miss rate 4% (40k misses), L2 miss rate 15% -> 6,000 requests reach Main Memory.
Question 3: Write-back with dirty bit vs Write-through with write buffer. Write-back significantly reduces system bus memory write traffic.`,
    tokenCount: 290,
    uploadedAt: '2026-09-22T09:00:00Z',
    chunks: [
      {
        id: 'chunk-3-1',
        documentId: 'doc-3',
        docName: 'CPE 401 - Mid-Semester Continuous Assessment Test 1 (2024).docx',
        docType: 'test_question',
        courseCode: 'CPE401',
        chunkIndex: 0,
        text: 'Question 2 [10 Marks]: Multi-level cache cascade: 1,000,000 memory instructions. L1 misses = 1,000,000 * 4% = 40,000 requests sent to L2. L2 misses = 40,000 * 15% = 6,000 requests sent to main memory. Overall global miss rate = 6,000 / 1,000,000 = 0.6%.',
        tokenLength: 54,
      },
      {
        id: 'chunk-3-2',
        documentId: 'doc-3',
        docName: 'CPE 401 - Mid-Semester Continuous Assessment Test 1 (2024).docx',
        docType: 'test_question',
        courseCode: 'CPE401',
        chunkIndex: 1,
        text: 'Question 3 [10 Marks]: Write-back vs Write-through: Write-through updates main memory on every write, causing heavy bus traffic. Write-back updates only the cache line and sets a Dirty Bit; the block is written to main memory only upon cache block eviction/replacement, minimizing bus congestion.',
        tokenLength: 53,
      },
    ],
  },
];

export const DEFAULT_LEARNING_PATH: LearningPathData = {
  courseTitle: 'Advanced Computer Architecture (CPE 401)',
  courseCode: 'CPE401',
  totalEstimatedHours: 28,
  studyPlanSummary:
    'Comprehensive 4-week exam mastery path focused on high-yield exam modules identified across 2021-2024 university past question papers, specifically Memory Hierarchy, Pipelining Hazards, and Arithmetic Algorithms.',
  examReadinessStrategy:
    'Combine conceptual foundation review with daily past question drill exercises. High-yield topics like Cache Tag Bit Allocation and Booth Algorithm appear in 100% of examined past papers.',
  completionPercentage: 45,
  modules: [
    {
      id: 'mod-1',
      weekNumber: 1,
      title: 'Memory Hierarchy & Cache Mapping Architectures',
      description: 'Master Direct, Fully Associative, and Set-Associative mapping address breakdown and AMAT calculations.',
      estimatedHours: 7,
      examFrequencyWeight: 'High Yield (Appeared in 100% of Past Exam Papers)',
      keyTopics: [
        'Locality of Reference (Temporal vs Spatial)',
        'Direct Mapping Address Field Calculation (Tag, Index, Offset)',
        'k-way Set Associative Sets and Tag Bit Storage',
        'Average Memory Access Time (AMAT) Multi-level Formulas',
      ],
      completedTopics: [
        'Locality of Reference (Temporal vs Spatial)',
        'Direct Mapping Address Field Calculation (Tag, Index, Offset)',
      ],
      recommendedPastQuestionDrill: '2023 Exam Question 1 & CAT 1 Question 2',
      milestoneTask: 'Solve 32-bit address field partitioning without error under 8 minutes.',
      status: 'in_progress',
    },
    {
      id: 'mod-2',
      weekNumber: 2,
      title: 'RISC Instruction Pipelining & Hazard Resolution',
      description: 'Examine 5-stage classic pipeline (IF, ID, EX, MEM, WB), data hazards, forwarding bypass paths, and branch penalties.',
      estimatedHours: 8,
      examFrequencyWeight: 'High Yield (Appeared in 90% of Past Exam Papers)',
      keyTopics: [
        'Classic 5-Stage RISC Pipeline Registers',
        'Structural Hazards & Memory Port Duplication',
        'Data Hazards (RAW, WAR, WAW) and Forwarding Unit Logic',
        'Branch Penalty & Dynamic Branch Prediction (1-bit and 2-bit counters)',
      ],
      completedTopics: [
        'Classic 5-Stage RISC Pipeline Registers',
      ],
      recommendedPastQuestionDrill: '2023 Exam Question 2 & 2022 Question 3',
      milestoneTask: 'Sketch forwarding datapath multiplexers for ALU-to-ALU bypass.',
      status: 'in_progress',
    },
    {
      id: 'mod-3',
      weekNumber: 3,
      title: 'Computer Arithmetic & Booth Multiplier Design',
      description: 'Understand 2s complement binary multiplication, Booth algorithm state machine, and fast division.',
      estimatedHours: 6,
      examFrequencyWeight: 'High Yield (Appeared in 85% of Past Exam Papers)',
      keyTopics: [
        'Signed Number Representation in 2s Complement',
        'Booth Algorithm Recoding Rules (00, 01, 10, 11)',
        'Tabular Step-by-Step Multiplication with Sign Bit Preservation',
        'Carry Lookahead Adders (CLA) vs Ripple Carry Adders',
      ],
      completedTopics: [],
      recommendedPastQuestionDrill: '2023 Exam Question 3',
      milestoneTask: 'Multiply -7 by +9 using 5-bit registers and verify result.',
      status: 'pending',
    },
    {
      id: 'mod-4',
      weekNumber: 4,
      title: 'I/O Subsystems, Bus Arbitration & Cache Coherence',
      description: 'Interrupt-driven I/O, DMA Controllers, and basic MSI protocol for multi-core processors.',
      estimatedHours: 7,
      examFrequencyWeight: 'Medium Yield (Appeared in 60% of Past Exam Papers)',
      keyTopics: [
        'Direct Memory Access (DMA) Cycle Stealing vs Burst Mode',
        'Daisy Chain & Centralized Bus Arbitration Protocols',
        'Write Invalidate vs Write Update Coherence Snooping',
        'MSI Protocol State Transition Diagram',
      ],
      completedTopics: [],
      recommendedPastQuestionDrill: '2022 Exam Question 5',
      milestoneTask: 'Draw DMA block transfer timeline between disk and RAM.',
      status: 'pending',
    },
  ],
  frequencyExamAdvice: {
    recommendedDailyCadence: '1.5 - 2 hours daily, with active problem solving in morning sessions',
    spacedRepetitionIntervals: 'Review Cache Tag Formulas on Days 1, 3, 7, and 14 to counter forgetting curve',
    criticalMilestoneDeadlines: [
      'Day 7: Complete Module 1 Past Questions Drill (Minimum 85% score)',
      'Day 14: Master Pipeline Hazards & Forwarding Diagrams',
      'Day 21: Full 3-Hour Timed Past Exam Simulation',
    ],
  },
};

export const INITIAL_STUDY_METRICS: StudyFrequencyMetric[] = [
  { date: '2026-10-02', sessionsCount: 2, minutesSpent: 65, queriesCount: 14, quizzesTaken: 1, intensity: 'moderate' },
  { date: '2026-10-03', sessionsCount: 3, minutesSpent: 90, queriesCount: 22, quizzesTaken: 2, intensity: 'high' },
  { date: '2026-10-04', sessionsCount: 1, minutesSpent: 45, queriesCount: 8, quizzesTaken: 0, intensity: 'light' },
  { date: '2026-10-05', sessionsCount: 4, minutesSpent: 120, queriesCount: 30, quizzesTaken: 3, intensity: 'peak' },
  { date: '2026-10-06', sessionsCount: 3, minutesSpent: 85, queriesCount: 18, quizzesTaken: 2, intensity: 'high' },
  { date: '2026-10-07', sessionsCount: 2, minutesSpent: 70, queriesCount: 16, quizzesTaken: 1, intensity: 'moderate' },
  { date: '2026-10-08', sessionsCount: 3, minutesSpent: 95, queriesCount: 24, quizzesTaken: 2, intensity: 'peak' },
];
