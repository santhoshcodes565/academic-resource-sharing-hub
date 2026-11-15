export const DEPARTMENTS = [
  { id: 'cs', name: 'Computer Science', code: 'CS', icon: 'Code', count: 1840 },
  { id: 'math', name: 'Mathematics', code: 'MATH', icon: 'Sigma', count: 1250 },
  { id: 'ee', name: 'Electrical Eng.', code: 'EE', icon: 'Cpu', count: 980 },
  { id: 'physics', name: 'Physics & Quantum', code: 'PHYS', icon: 'Atom', count: 860 },
  { id: 'econ', name: 'Economics & Finance', code: 'ECON', icon: 'TrendingUp', count: 620 },
  { id: 'bio', name: 'Bioengineering', code: 'BIO', icon: 'Dna', count: 540 },
];

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'exam', label: 'Past Exams & Midterms', icon: 'FileText' },
  { id: 'notes', label: 'Lecture Notes', icon: 'BookOpen' },
  { id: 'cheatsheet', label: 'Cheatsheets & Formulas', icon: 'Zap' },
  { id: 'lab', label: 'Lab Reports & Code', icon: 'Terminal' },
  { id: 'assignment', label: 'Problem Set Solutions', icon: 'CheckSquare' },
];

export const MOCK_RESOURCES = [
  {
    id: 'res-1',
    title: 'CS 106B: Comprehensive Midterm Prep Pack & Solved Exams',
    department: 'cs',
    departmentName: 'Computer Science',
    courseCode: 'CS-106B',
    courseTitle: 'Programming Abstractions in C++',
    category: 'exam',
    semester: 'Fall 2024',
    professor: 'Dr. Keith Schwarz',
    university: 'Stanford University',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    pages: 34,
    downloads: 3840,
    likes: 412,
    rating: 4.9,
    reviewsCount: 58,
    isVerified: true,
    isHighYield: true,
    uploadedAt: '2 days ago',
    author: {
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Head TA / Class of 25',
      karma: 4820
    },
    description: 'Complete synthesis of recursion backtracking, custom ADTs (Grid, Map, Vector), dynamic memory management, and pointers. Includes 3 previous years of midterm exams with step-by-step verified solutions.',
    tags: ['Recursion', 'Backtracking', 'C++', 'Data Structures', 'Exam Prep'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Recursive Backtracking Paradigm & Decision Trees',
        content: `// Key Principle: Choose, Explore, Unchoose
bool solveMaze(Maze& m, Point curr) {
    if (m.isExit(curr)) return true;
    for (Point next : m.getValidMoves(curr)) {
        m.markVisited(curr); // Choose
        if (solveMaze(m, next)) return true; // Explore
        m.unmarkVisited(curr); // Unchoose
    }
    return false;
}
* Time Complexity: O(b^d) where b is branching factor and d is tree depth.
* Memory Invariant: State must always revert upon backtrack unwinding.`
      },
      {
        pageNumber: 2,
        title: 'Big-O Complexity Bounds for Core Standard Template Library Containers',
        content: `Container   | Access    | Search    | Insertion | Deletion
Vector      | O(1)      | O(N)      | O(1)*     | O(N)
LinkedList  | O(N)      | O(N)      | O(1)      | O(1)
HashMap     | O(1)      | O(1)      | O(1)      | O(1)
BinaryTree  | O(log N)  | O(log N)  | O(log N)  | O(log N)`
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'Student',
        text: 'The recursion tree diagram on page 6 saved me during the actual exam. 10/10 recommendation!',
        time: '1 day ago',
        upvotes: 24
      },
      {
        id: 'c2',
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'Verified TA',
        text: 'Checked and approved. All solutions conform to the official grading rubric for 2024.',
        time: '2 days ago',
        upvotes: 42
      }
    ]
  },
  {
    id: 'res-2',
    title: 'MATH 215: Multivariable Calculus Full Course Cheat Sheet & Formulas',
    department: 'math',
    departmentName: 'Mathematics',
    courseCode: 'MATH-215',
    courseTitle: 'Multivariable & Vector Calculus',
    category: 'cheatsheet',
    semester: 'Fall 2024',
    professor: 'Prof. Sarah Lin',
    university: 'MIT',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    pages: 6,
    downloads: 6120,
    likes: 890,
    rating: 5.0,
    reviewsCount: 112,
    isVerified: true,
    isHighYield: true,
    uploadedAt: '1 week ago',
    author: {
      name: 'Devin Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Math Olympiad Gold / Peer Tutor',
      karma: 7190
    },
    description: 'High-density LaTeX formula sheet covering Green Theorem, Stokes Theorem, Divergence Theorem, Lagrange Multipliers, and Quadric Surfaces with 3D projection schematics.',
    tags: ['Vector Calculus', 'Stokes Theorem', 'Green Theorem', 'Integrals', 'Formulas'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Fundamental Vector Theorems Comparison',
        content: `1. Green\'s Theorem:
   ∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA

2. Stokes\' Theorem:
   ∮_C F · dr = ∬_S (∇ × F) · dS

3. Divergence Theorem (Gauss):
   ∯_S F · dS = ∭_V (∇ · F) dV`
      }
    ],
    comments: [
      {
        id: 'c3',
        author: 'Priya Patel',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        role: 'Sophomore',
        text: 'Cleanest LaTeX formatting I have ever seen. Printed it double-sided for the exam sheet!',
        time: '5 days ago',
        upvotes: 31
      }
    ]
  },
  {
    id: 'res-3',
    title: 'EE 201: Signals & Systems Complete Lecture Summary & Bode Plots',
    department: 'ee',
    departmentName: 'Electrical Eng.',
    courseCode: 'EE-201',
    courseTitle: 'Continuous & Discrete Signals',
    category: 'notes',
    semester: 'Fall 2024',
    professor: 'Dr. Alan Oppenheim',
    university: 'UC Berkeley',
    fileType: 'PDF',
    fileSize: '9.4 MB',
    pages: 48,
    downloads: 1980,
    likes: 245,
    rating: 4.8,
    reviewsCount: 29,
    isVerified: true,
    isHighYield: false,
    uploadedAt: '3 days ago',
    author: {
      name: 'Jessica Wu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'EE Senior',
      karma: 3410
    },
    description: 'Step-by-step derivation of Fourier Transform, Laplace Transform with ROC (Region of Convergence), Z-transform, and intuitive rules for hand-drawing asymptotic Bode magnitude and phase plots.',
    tags: ['Signals', 'Fourier Transform', 'Laplace', 'Bode Plot', 'DSP'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Laplace Transform & Region of Convergence (ROC)',
        content: `X(s) = ∫_{-∞}^{∞} x(t) e^{-st} dt, where s = σ + jω
Properties:
1. ROC of X(s) consists of strips parallel to the jω axis in the s-plane.
2. If x(t) is of finite duration, ROC is the entire s-plane.
3. For a stable causal system, all poles must lie in the Left-Half Plane (LHP).`
      }
    ],
    comments: []
  },
  {
    id: 'res-4',
    title: 'PHYS 150: Quantum Mechanics & Wave Equations Problem Sets',
    department: 'physics',
    departmentName: 'Physics & Quantum',
    courseCode: 'PHYS-150',
    courseTitle: 'Quantum Foundations',
    category: 'assignment',
    semester: 'Spring 2024',
    professor: 'Prof. David Griffiths',
    university: 'Harvard University',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    pages: 28,
    downloads: 2410,
    likes: 310,
    rating: 4.7,
    reviewsCount: 35,
    isVerified: false,
    isHighYield: true,
    uploadedAt: '2 weeks ago',
    author: {
      name: 'Jordan Miller',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      role: 'Graduate Researcher',
      karma: 2150
    },
    description: 'Worked solutions for 1D Infinite Square Well, Harmonic Oscillator via Ladder Operators, and Quantum Tunneling through rectangular barriers.',
    tags: ['Quantum', 'Schrodinger', 'Harmonic Oscillator', 'Wavefunction'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Time-Independent Schrödinger Equation (TISE)',
        content: `- (ħ² / 2m) d²ψ/dx² + V(x)ψ = Eψ
Ladder Operators:
a₊ = (1 / √(2mħω)) (-ip + mωx)
a₋ = (1 / √(2mħω)) (+ip + mωx)`
      }
    ],
    comments: []
  },
  {
    id: 'res-5',
    title: 'CS 229: Machine Learning Math Foundations & Matrix Calculus Guide',
    department: 'cs',
    departmentName: 'Computer Science',
    courseCode: 'CS-229',
    courseTitle: 'Machine Learning',
    category: 'notes',
    semester: 'Fall 2024',
    professor: 'Dr. Andrew Ng',
    university: 'Stanford University',
    fileType: 'PDF',
    fileSize: '7.3 MB',
    pages: 52,
    downloads: 9420,
    likes: 1420,
    rating: 4.95,
    reviewsCount: 184,
    isVerified: true,
    isHighYield: true,
    uploadedAt: '4 days ago',
    author: {
      name: 'Siddharth Rao',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      role: 'AI Researcher / PhD',
      karma: 9840
    },
    description: 'Essential linear algebra, gradient derivations for Backpropagation, Cross-Entropy Loss, PCA Eigenvalue decomposition, and Support Vector Machines margin maximization.',
    tags: ['Machine Learning', 'Matrix Calculus', 'Gradient Descent', 'SVM', 'PCA'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Matrix Calculus Identities for Backpropagation',
        content: `Let f(W) = ||XW - y||₂²
Gradient with respect to W:
∇_W f(W) = 2 X^T (XW - y)
Closed form (Normal Equation):
W* = (X^T X)^{-1} X^T y`
      }
    ],
    comments: []
  },
  {
    id: 'res-6',
    title: 'ECON 101: Microeconomic Principles Midterm Solved Papers (2021-2024)',
    department: 'econ',
    departmentName: 'Economics & Finance',
    courseCode: 'ECON-101',
    courseTitle: 'Principles of Microeconomics',
    category: 'exam',
    semester: 'Fall 2024',
    professor: 'Prof. Gregory Mankiw',
    university: 'Princeton University',
    fileType: 'PDF',
    fileSize: '3.6 MB',
    pages: 22,
    downloads: 1840,
    likes: 198,
    rating: 4.6,
    reviewsCount: 19,
    isVerified: true,
    isHighYield: false,
    uploadedAt: '6 days ago',
    author: {
      name: 'Chloe Bennett',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Econ Society President',
      karma: 2900
    },
    description: 'Consumer utility maximization, indifference curves, price elasticity of demand calculations, deadweight loss under taxation, and monopoly price discrimination models.',
    tags: ['Microeconomics', 'Elasticity', 'Supply & Demand', 'Consumer Theory'],
    previewPages: [
      {
        pageNumber: 1,
        title: 'Consumer Surplus, Producer Surplus & Deadweight Loss',
        content: `Price Elasticity of Demand (PED):
PED = (% Change in Q) / (% Change in P) = (dQ/dP) * (P/Q)
* PED > 1 : Elastic
* PED = 1 : Unit Elastic
* PED < 1 : Inelastic`
      }
    ],
    comments: []
  }
];

export const INITIAL_USER_SAVED = ['res-1', 'res-2', 'res-5'];
export const INITIAL_USER_UPLOADS = ['res-3'];
