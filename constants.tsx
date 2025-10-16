
import React from 'react';
import type { User, Assignment, MethodicalResource, Badge } from './types';
import { Role, MethodicalResourceCategory, BadgeKey } from './types';

// --- ICONS ---

const BrainIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 14.893c-1.313-.42-2.343-1.42-2.673-2.657M19.129 14.893c1.313-.42 2.343-1.42 2.673-2.657M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v.01M12 20v.01M4 12h.01M20 12h.01" />
  </svg>
);

const RocketIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const TargetIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- GAMIFICATION ---

export const LEVELS = [
  { level: 1, name: 'Novice', minXp: 0 },
  { level: 2, name: 'Explorer', minXp: 100 },
  { level: 3, name: 'Master', minXp: 300 },
  { level: 4, name: 'Genius', minXp: 700 },
  { level: 5, name: 'Legend', minXp: 1500 },
];

export const BADGES: Record<BadgeKey, Badge> = {
  [BadgeKey.AI_EXPLORER]: {
    key: BadgeKey.AI_EXPLORER,
    name: 'AI Explorer',
    description: 'Asked 10 questions to the AI Assistant.',
    icon: RocketIcon
  },
  [BadgeKey.QUIZ_MASTER]: {
    key: BadgeKey.QUIZ_MASTER,
    name: 'Quiz Master',
    description: 'Completed 5 quizzes.',
    icon: BrainIcon
  },
  [BadgeKey.PERFECT_SCORE]: {
    key: BadgeKey.PERFECT_SCORE,
    name: 'Perfect Score',
    description: 'Achieved a perfect score on a quiz.',
    icon: TargetIcon
  },
  [BadgeKey.STREAK_MASTER]: {
    key: BadgeKey.STREAK_MASTER,
    name: 'Streak Master',
    description: 'Completed assignments for 3 days in a row.',
    icon: BoltIcon
  },
};

// --- MOCK DATA ---

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Doe',
    email: 'alex@example.com',
    passwordHash: 'password123',
    role: Role.Student,
    avatar: 'https://picsum.photos/seed/alex/200',
    level: 2,
    xp: 150,
    hp: 80,
    badges: [BadgeKey.AI_EXPLORER],
    completedAssignments: ['as-1'],
    recommendations: ['Try the "Intro to Python" project.', 'Review chapter 3 of your math textbook.'],
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    passwordHash: 'password123',
    role: Role.Student,
    avatar: 'https://picsum.photos/seed/jane/200',
    level: 3,
    xp: 320,
    hp: 100,
    badges: [BadgeKey.AI_EXPLORER, BadgeKey.QUIZ_MASTER],
    completedAssignments: ['as-1', 'as-2'],
    recommendations: ['Explore the concept of recursion in Computer Science.'],
  },
  {
    id: 'user-3',
    name: 'Sam Wilson',
    email: 'sam@example.com',
    passwordHash: 'password123',
    role: Role.Student,
    avatar: 'https://picsum.photos/seed/sam/200',
    level: 1,
    xp: 50,
    hp: 100,
    badges: [],
    completedAssignments: [],
    recommendations: ['Start with the "Basics of Algebra" assignment.'],
  },
  {
    id: 'user-teacher',
    name: 'Dr. Evelyn Reed',
    email: 'teacher@example.com',
    passwordHash: 'password123',
    role: Role.Teacher,
    avatar: 'https://picsum.photos/seed/teacher/200',
    level: 0,
    xp: 0,
    hp: 0,
    badges: [],
    completedAssignments: [],
    recommendations: [],
  }
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'as-1',
    title: 'Basics of Algebra',
    deadline: '2024-09-15',
    status: 'Not Started',
    xpReward: 50,
    quiz: {
      questions: [
        { question: 'What is 2 + 2 * 2?', options: ['6', '8', '4'], correctAnswer: '6' },
        { question: 'Solve for x: x + 5 = 10', options: ['10', '5', '15'], correctAnswer: '5' },
      ],
    },
  },
  {
    id: 'as-2',
    title: 'Introduction to Python',
    deadline: '2024-09-20',
    status: 'Not Started',
    xpReward: 75,
    quiz: {
      questions: [
        { question: 'What keyword is used to define a function in Python?', options: ['def', 'function', 'fun'], correctAnswer: 'def' },
        { question: 'Which of these is NOT a valid variable name?', options: ['my_var', '_myvar', '2myvar'], correctAnswer: '2myvar' },
        { question: 'What is the output of `print("Hello" + " " + "World")`?', options: ['HelloWorld', 'Hello World', 'Error'], correctAnswer: 'Hello World' },
      ],
    },
  },
  {
    id: 'as-3',
    title: 'Scientific Method',
    deadline: '2024-09-25',
    status: 'Not Started',
    xpReward: 60,
    quiz: {
      questions: [
        { question: 'What is the first step of the scientific method?', options: ['Hypothesis', 'Observation', 'Experiment'], correctAnswer: 'Observation' },
        { question: 'A hypothesis must be...', options: ['Proven correct', 'Testable', 'A fact'], correctAnswer: 'Testable' },
      ],
    },
  },
];


export const MOCK_RESOURCES: MethodicalResource[] = [
    {
        id: 'mr-1',
        title: 'Lesson Plan: Intro to Photosynthesis',
        description: 'A complete 1-hour lesson plan for 7th-grade science, including activities and assessment materials.',
        category: MethodicalResourceCategory.LESSON_PLANS,
        link: '#',
        type: 'PDF'
    },
    {
        id: 'mr-2',
        title: 'Project: Build a Simple Website',
        description: 'A project-based learning module for high school students to learn HTML and CSS fundamentals.',
        category: MethodicalResourceCategory.PROJECTS,
        link: '#',
        type: 'Link'
    },
    {
        id: 'mr-3',
        title: 'The Socratic Method Toolkit',
        description: 'A guide for teachers on using the Socratic method to foster critical thinking in the classroom.',
        category: MethodicalResourceCategory.CRITICAL_THINKING,
        link: '#',
        type: 'PDF'
    },
    {
        id: 'mr-4',
        title: 'Using AI as a Teaching Assistant',
        description: 'Best practices and ideas for integrating AI tools like Gemini to support personalized learning.',
        category: MethodicalResourceCategory.AI_IN_EDUCATION,
        link: '#',
        type: 'Link'
    },
    {
        id: 'mr-5',
        title: 'Gamifying Your Math Class',
        description: 'Strategies and examples for incorporating game mechanics into mathematics lessons to boost engagement.',
        category: MethodicalResourceCategory.LESSON_PLANS,
        link: '#',
        type: 'PDF'
    }
];
