
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Assignment, Quiz, QuizQuestion, ChatMessage, MethodicalResource } from './types';
import { Role, Subject, MethodicalResourceCategory, BadgeKey } from './types';
import { MOCK_USERS, MOCK_ASSIGNMENTS, MOCK_RESOURCES, LEVELS, BADGES } from './constants';
import { getAiResponse, getLearningRecommendation, getQuizFeedback } from './services/geminiService';

// --- HELPER FUNCTIONS ---
const getLevelFromXp = (xp: number) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

// --- UI COMPONENTS ---
const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value} / {max}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const BadgeDisplay: React.FC<{ badgeKey: BadgeKey }> = ({ badgeKey }) => {
    const badge = BADGES[badgeKey];
    if (!badge) return null;
    const Icon = badge.icon;
    return (
        <div className="group relative flex flex-col items-center">
            <div className="p-3 bg-yellow-100 rounded-full border-2 border-yellow-300">
                <Icon className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-bold">{badge.name}</p>
                <p>{badge.description}</p>
            </div>
        </div>
    );
};


const Header: React.FC<{ user: User | null; onNavigate: (view: string) => void; onLogout: () => void }> = ({ user, onNavigate, onLogout }) => {
  const navItems = [
    { view: 'home', label: 'Home' },
    { view: 'ai_assistant', label: 'AI Assistant' },
    { view: 'assignments', label: 'Assignments' },
    { view: 'resources', label: 'Methodical Resources' },
    { view: 'profile', label: 'Profile' },
  ];

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18"/></svg>
          <h1 className="text-xl font-bold text-gray-800 ml-2">AI School</h1>
        </div>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              {navItems.map(item => (
                <button key={item.view} onClick={() => onNavigate(item.view)} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  {item.label}
                </button>
              ))}
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
               <button onClick={() => onNavigate('login')} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                Login
              </button>
               <button onClick={() => onNavigate('register')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Register
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};


const Footer: React.FC = () => (
    <footer className="bg-white mt-auto py-4 border-t">
        <div className="container mx-auto text-center text-sm text-gray-500">
            <p>AI School Platform</p>
            <p>Almaty, ul. Ashimova 253. Tel: +7 705 888 8901</p>
        </div>
    </footer>
);

const QuizModal: React.FC<{ assignment: Assignment; onClose: () => void; onComplete: (score: number, total: number) => void }> = ({ assignment, onClose, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
    const [feedback, setFeedback] = useState<{[key: number]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentQuestion = assignment.quiz.questions[currentQuestionIndex];

    const handleAnswer = async (answer: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
        const feedbackText = await getQuizFeedback(currentQuestion.question, answer, currentQuestion.correctAnswer);
        setFeedback(prev => ({ ...prev, [currentQuestionIndex]: feedbackText }));
        setIsSubmitting(false);
    };

    const handleNext = () => {
        if (currentQuestionIndex < assignment.quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            let score = 0;
            assignment.quiz.questions.forEach((q, index) => {
                if (selectedAnswers[index] === q.correctAnswer) {
                    score++;
                }
            });
            onComplete(score, assignment.quiz.questions.length);
        }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl transform transition-all">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{assignment.title}</h2>
          <div className="mb-6">
            <p className="text-lg text-gray-700">{currentQuestion.question}</p>
          </div>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              const isCorrect = currentQuestion.correctAnswer === option;
              
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-colors duration-200 ";
              if (!selectedAnswers[currentQuestionIndex]) {
                  buttonClass += "bg-gray-100 hover:bg-indigo-100 border-gray-300";
              } else if (isSelected && isCorrect) {
                  buttonClass += "bg-green-100 border-green-400 text-green-800 font-semibold";
              } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-100 border-red-400 text-red-800 font-semibold";
              } else if (isCorrect) {
                  buttonClass += "bg-green-100 border-green-400";
              } else {
                  buttonClass += "bg-gray-50 border-gray-200 text-gray-500";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswers[currentQuestionIndex]}
                  className={buttonClass}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {feedback[currentQuestionIndex] && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                  <p className="font-semibold">AI Feedback:</p>
                  <p>{feedback[currentQuestionIndex]}</p>
              </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
            {selectedAnswers[currentQuestionIndex] && (
                <button onClick={handleNext} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    {isSubmitting ? 'Thinking...' : (currentQuestionIndex < assignment.quiz.questions.length - 1 ? 'Next' : 'Finish')}
                </button>
            )}
          </div>
        </div>
      </div>
    );
};


// --- PAGE COMPONENTS ---

const HomeScreen: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => (
  <div className="text-center">
    <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Welcome to AI School</h1>
    <p className="text-xl text-gray-600 mb-8">A platform for future learning.</p>
    <button onClick={() => onNavigate('ai_assistant')} className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
      Start Learning
    </button>
  </div>
);

const AuthScreen: React.FC<{ onAuthSuccess: (user: User) => void; onNavigate: (view: string) => void; isLogin: boolean }> = ({ onAuthSuccess, onNavigate, isLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.Student);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            if (isLogin) {
                const user = users.find(u => u.email === email && u.passwordHash === password);
                if (user) {
                    onAuthSuccess(user);
                } else {
                    setError('Invalid email or password.');
                }
            } else { // Register
                if (users.some(u => u.email === email)) {
                    setError('An account with this email already exists.');
                    return;
                }
                const newUser: User = { 
                    id: `user-${Date.now()}`, 
                    name, 
                    email, 
                    passwordHash: password,
                    role, 
                    avatar: `https://picsum.photos/seed/${Date.now()}/200`,
                    level: 1, xp: 0, hp: 100, badges: [], completedAssignments: [], recommendations: []
                };
                localStorage.setItem('users', JSON.stringify([...users, newUser]));
                onAuthSuccess(newUser);
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'Login' : 'Create an Account'}</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value={Role.Student}>Student</option>
                                <option value={Role.Teacher}>Teacher</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => onNavigate(isLogin ? 'register' : 'login')} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};


const ProfileScreen: React.FC<{ user: User; onUpdateUser: (updatedUser: User) => void }> = ({ user, onUpdateUser }) => {
    const levelInfo = getLevelFromXp(user.xp);
    const nextLevel = LEVELS.find(l => l.level === levelInfo.level + 1);
    
    const handleReset = () => {
        if(window.confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
            onUpdateUser({
                ...user,
                xp: 0,
                hp: 100,
                level: 1,
                badges: [],
                completedAssignments: [],
                recommendations: []
            });
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                <img src={user.avatar} alt="Avatar" className="w-32 h-32 rounded-full mb-4 border-4 border-indigo-200" />
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-500">{user.role}</p>
                 <button className="mt-4 text-sm text-indigo-600 hover:underline">Edit Profile</button>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800">My Progress</h3>
                <div className="space-y-6">
                    <ProgressBar value={user.xp} max={nextLevel ? nextLevel.minXp : user.xp} color="bg-indigo-600" label={`Level ${levelInfo.level}: ${levelInfo.name}`} />
                    <ProgressBar value={user.hp} max={100} color="bg-green-500" label="Health Points" />
                </div>
                
                <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800">Badges Earned</h3>
                 {user.badges.length > 0 ? (
                    <div className="flex space-x-4">
                       {user.badges.map(badgeKey => <BadgeDisplay key={badgeKey} badgeKey={badgeKey} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">No badges yet. Keep learning to earn them!</p>
                )}
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-gray-800">AI Recommendations</h3>
                {user.recommendations.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {user.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                ) : (
                    <p className="text-gray-500">Ask the AI assistant for recommendations!</p>
                )}
            </div>

             <div className="lg:col-span-3">
                 <button onClick={handleReset} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                    Reset Progress
                </button>
            </div>
        </div>
    );
};

const AssignmentsScreen: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    const [assignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
    const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);

    const handleQuizComplete = (score: number, total: number) => {
        if (!activeQuiz) return;
        
        const xpGained = Math.round((score / total) * activeQuiz.xpReward);
        const hpChange = score === total ? 10 : (score > 0 ? 0 : -20);
        
        const updatedUser = {
            ...user,
            xp: user.xp + xpGained,
            hp: Math.min(100, Math.max(0, user.hp + hpChange)),
            completedAssignments: [...new Set([...user.completedAssignments, activeQuiz.id])],
            level: getLevelFromXp(user.xp + xpGained).level
        };

        alert(`Quiz Complete!\nYou scored ${score}/${total}.\nYou earned ${xpGained} XP.`);
        onUpdateUser(updatedUser);
        setActiveQuiz(null);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">My Assignments</h2>
            <div className="space-y-4">
                {assignments.map(assignment => {
                    const isCompleted = user.completedAssignments.includes(assignment.id);
                    return (
                        <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
                                <p className="text-gray-500">Deadline: {assignment.deadline} | Reward: {assignment.xpReward} XP</p>
                            </div>
                            <div>
                                {isCompleted ? (
                                    <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full">Completed</span>
                                ) : (
                                    <button onClick={() => setActiveQuiz(assignment)} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                        Start Task
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {activeQuiz && <QuizModal assignment={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} />}
        </div>
    );
};

const AIAssistantScreen: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    const [subject, setSubject] = useState<Subject>(Subject.ComputerScience);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const geminiHistory = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setChatHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiText = await getAiResponse(input, subject, geminiHistory);
        const aiMessage: ChatMessage = { sender: 'ai', text: aiText };
        setChatHistory(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleGetRecommendation = async () => {
        setIsLoading(true);
        const recommendation = await getLearningRecommendation(subject, user.level, user.completedAssignments);
        const aiMessage: ChatMessage = { sender: 'ai', text: `Here's a personalized recommendation for you: ${recommendation}` };
        setChatHistory(prev => [...prev, aiMessage]);
        onUpdateUser({ ...user, recommendations: [...user.recommendations, recommendation] });
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="p-2 border rounded-md">
                    {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {isLoading && <div className="flex justify-start"><div className="max-w-lg p-3 rounded-lg bg-gray-200 text-gray-800">Thinking...</div></div>}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Send</button>
                <button onClick={handleGetRecommendation} disabled={isLoading} className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">Get Recommendation</button>
            </div>
        </div>
    );
};

const MethodicalResourcesScreen: React.FC = () => {
    const [resources] = useState<MethodicalResource[]>(MOCK_RESOURCES);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    
    const filteredResources = resources.filter(res => 
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'All' || res.category === categoryFilter)
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Methodical Resources</h2>
            <div className="flex space-x-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border rounded-md shadow-sm"
                />
                <select 
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="p-2 border rounded-md shadow-sm bg-white"
                >
                    <option value="All">All Categories</option>
                    {Object.values(MethodicalResourceCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(res => (
                    <div key={res.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                        <span className="text-xs font-semibold uppercase text-indigo-500 mb-2">{res.category}</span>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{res.title}</h3>
                        <p className="text-gray-600 text-sm flex-grow mb-4">{res.description}</p>
                        <a href={res.link} target="_blank" rel="noopener noreferrer" className="mt-auto self-start px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                           Open {res.type}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize with mock data if localStorage is empty
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      localStorage.setItem('users', JSON.stringify(MOCK_USERS));
      setAllUsers(MOCK_USERS);
    } else {
        setAllUsers(JSON.parse(storedUsers));
    }
    
    const loggedInUser = localStorage.getItem('currentUser');
    if(loggedInUser) {
        const user = JSON.parse(loggedInUser);
        setCurrentUser(user);
        setCurrentView('home');
    } else {
        setCurrentView('login');
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('login');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    const updatedAllUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    setAllUsers(updatedAllUsers);
    localStorage.setItem('users', JSON.stringify(updatedAllUsers));
  };


  const renderContent = () => {
    if (!currentUser) {
      switch (currentView) {
        case 'login':
          return <AuthScreen isLogin={true} onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentView} />;
        case 'register':
          return <AuthScreen isLogin={false} onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentView} />;
        default:
          return <AuthScreen isLogin={true} onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentView} />;
      }
    }

    switch (currentView) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentView} />;
      case 'profile':
        return <ProfileScreen user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'assignments':
        return <AssignmentsScreen user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'ai_assistant':
        return <AIAssistantScreen user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'resources':
        return <MethodicalResourcesScreen />;
      default:
        return <HomeScreen onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={currentUser} onNavigate={setCurrentView} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}
