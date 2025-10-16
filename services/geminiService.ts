
import { GoogleGenAI } from "@google/genai";
import type { Subject } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getAiResponse = async (prompt: string, subject: Subject, chatHistory: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  try {
    const systemInstruction = `You are a helpful and engaging AI tutor for the AI School Platform. Your current subject is ${subject}. Be encouraging and provide clear, concise explanations suitable for a student. Do not greet the user unless it's the first message.`;

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
        model: model,
        contents: [...chatHistory, { role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 1,
            topK: 32,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};


export const getLearningRecommendation = async (subject: Subject, level: number, completedAssignments: string[]): Promise<string> => {
    try {
        const prompt = `Based on the following student profile, generate one concise, actionable learning recommendation.
        - Subject: ${subject}
        - Current Level: ${level}
        - Completed Assignments: ${completedAssignments.join(', ') || 'None'}
        
        The recommendation should be a short, encouraging sentence suggesting what to learn or practice next. For example: 'Try tackling the "Introduction to Python" assignment next!' or 'Review the concepts of fractions to solidify your understanding.'`;

        const model = 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
             config: {
                temperature: 0.8,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error getting learning recommendation:", error);
        return "Could not generate a recommendation at this time.";
    }
};

export const getQuizFeedback = async (question: string, userAnswer: string, correctAnswer: string): Promise<string> => {
    // FIX: Moved `isCorrect` variable declaration out of the try block to make it accessible in the catch block.
    const isCorrect = userAnswer === correctAnswer;
    try {
        const prompt = `A student answered a quiz question.
        - Question: "${question}"
        - Their Answer: "${userAnswer}"
        - Correct Answer: "${correctAnswer}"

        The student's answer was ${isCorrect ? 'correct' : 'incorrect'}. 
        Provide a brief, one-sentence feedback. If correct, be encouraging. If incorrect, briefly explain why the correct answer is right without being discouraging.`;

        const model = 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error getting quiz feedback:", error);
        return isCorrect ? "Great job!" : `The correct answer is ${correctAnswer}.`;
    }
};