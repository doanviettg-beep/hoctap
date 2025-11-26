export enum AppMode {
  HOME = 'HOME',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  EXAM_GENERATOR = 'EXAM_GENERATOR',
  ONLINE_TEST = 'ONLINE_TEST'
}

export enum Grade {
  GRADE_3 = 'Khối 3',
  GRADE_4 = 'Khối 4',
  GRADE_5 = 'Khối 5'
}

export enum Subject {
  IT = 'Tin học',
  TECH = 'Công nghệ'
}

export enum Semester {
  SEM_1 = 'Học kì I',
  SEM_2_FINAL = 'Cuối học kì II'
}

export interface ExamConfig {
  grade: Grade;
  subject: Subject;
  semester: Semester;
  matrixFile?: File | null;
  specFile?: File | null;
}

export interface QuizQuestion {
  id: number;
  type: 'MCQ' | 'MATCHING' | 'FILL_IN';
  text: string;
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ
  matchingPairs?: { a: string; b: string }[]; // For Matching
  fillInParts?: { text: string; blanks: number }[]; // For Fill-in
}

export interface GeneratedExam {
  title: string;
  content: string; // Markdown or HTML content for the Word doc
}

export interface OnlineQuizData {
  title: string;
  questions: QuizQuestion[];
}
