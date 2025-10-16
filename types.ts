
export enum Role {
  Student = 'Student',
  Teacher = 'Teacher',
}

export enum BadgeKey {
  AI_EXPLORER = 'AI_EXPLORER',
  QUIZ_MASTER = 'QUIZ_MASTER',
  PERFECT_SCORE = 'PERFECT_SCORE',
  STREAK_MASTER = 'STREAK_MASTER',
}

export interface Badge {
  key: BadgeKey;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In a real app, this would be a hash
  role: Role;
  avatar: string;
  level: number;
  xp: number;
  hp: number;
  badges: BadgeKey[];
  completedAssignments: string[];
  recommendations: string[];
}

export interface Assignment {
  id: string;
  title: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  xpReward: number;
  quiz: Quiz;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum MethodicalResourceCategory {
  LESSON_PLANS = 'Lesson plans',
  PROJECTS = 'Projects',
  CRITICAL_THINKING = 'Critical thinking tools',
  AI_IN_EDUCATION = 'AI in education',
}

export interface MethodicalResource {
  id: string;
  title: string;
  description: string;
  category: MethodicalResourceCategory;
  link: string;
  type: 'PDF' | 'Link';
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export enum Subject {
    ComputerScience = 'Computer Science',
    Mathematics = 'Mathematics',
    Language = 'Language',
    Science = 'Science',
}
