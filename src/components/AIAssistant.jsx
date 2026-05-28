import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Sparkles, AlertCircle, Bot, Zap, ShieldAlert, CheckCircle2, Key, ExternalLink, Pencil } from 'lucide-react';
import { addDays, format, parseISO, isSameDay } from 'date-fns';

export default function AIAssistant({ apiKey, setApiKey }) {
  const { tasks, rearrangeTasks } = useTasks();
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Acadesk AI Planner. Tell me about any schedule changes, new tasks, or cancellations, and I will instantly reorganize your timetable."
    }
  ]);
  const [mode, setMode] = useState(apiKey ? 'gemini' : 'local');

  // Keep mode in sync with apiKey presence if it's set
  useEffect(() => {
    if (apiKey) {
      setMode('gemini');
    } else {
      setMode('local');
    }
  }, [apiKey]);

  // Trigger local task visual flash effect on dashboard
  const triggerFlashAnimation = () => {
    const listElement = document.getElementById('tasks-timeline-container');
    if (listElement) {
      listElement.classList.remove('flash-rearrange');
      // Trigger reflow to restart animation
      void listElement.offsetWidth;
      listElement.classList.add('flash-rearrange');
    }
  };

  // --- LOCAL REGEX NLP SCHEDULER ENGINE ---
  const handleLocalReschedule = (userText) => {
    const text = userText.toLowerCase();
    let updatedTasks = [...tasks];
    let responseText = '';
    let matchesFound = false;

    // Helper: Find shift duration
    let shiftDays = 0;
    const dayMatch = text.match(/(\d+)\s*day/);
    const weekMatch = text.match(/(\d+)\s*week/);
    
    if (dayMatch) {
      shiftDays = parseInt(dayMatch[1]);
    } else if (weekMatch) {
      shiftDays = parseInt(weekMatch[1]) * 7;
    } else if (text.includes('tomorrow')) {
      shiftDays = 1;
    } else if (text.includes('next week')) {
      shiftDays = 7;
    } else if (text.includes('postpone') || text.includes('delay') || text.includes('shift') || text.includes('move')) {
      // Default fallback shift
      shiftDays = 1;
    }

    // Scenario A: Shift EVERYTHING
    if (text.includes('everything') || text.includes('all tasks') || text.includes('all plans')) {
      if (shiftDays > 0) {
        updatedTasks = tasks.map(t => ({
          ...t,
          date: addDays(new Date(t.date), shiftDays).toISOString()
        }));
        responseText = `Acknowledged. I've rescheduled all upcoming deadlines and pushed them back by ${shiftDays} day(s) to give you extra breathing room.`;
        matchesFound = true;
      }
    } 
    // Scenario B: Shift specific Course Code (e.g. CS401)
    else {
      const courseMatch = text.match(/cs\s*\d+/i);
      if (courseMatch) {
        const targetCourse = courseMatch[0].toUpperCase().replace(/\s+/g, '');
        if (shiftDays > 0) {
          let count = 0;
          updatedTasks = tasks.map(t => {
            if (t.course.toUpperCase() === targetCourse) {
              count++;
              return {
                ...t,
                date: addDays(new Date(t.date), shiftDays).toISOString()
              };
            }
            return t;
          });
          
          if (count > 0) {
            responseText = `Understood. I identified ${count} tasks for course ${targetCourse} and successfully delayed them by ${shiftDays} day(s).`;
            matchesFound = true;
          } else {
            responseText = `I found no upcoming tasks for course ${targetCourse} to delay.`;
            matchesFound = true;
          }
        }
      }
    }

    // Scenario C: Emergency "Today's Plan Changed"
    if (!matchesFound && (text.includes('emergency') || text.includes('plan changed') || text.includes('today'))) {
      const today = new Date();
      let affectedCount = 0;
      
      // Delay all today's tasks to tomorrow
      updatedTasks = tasks.map(t => {
        try {
          if (isSameDay(new Date(t.date), today)) {
            affectedCount++;
            return {
              ...t,
              date: addDays(new Date(t.date), 1).toISOString()
            };
          }
        } catch (e) {}
        return t;
      });

      if (affectedCount > 0) {
        responseText = `Oh no! I've rescheduled today's emergency deadlines, moving ${affectedCount} task(s) to tomorrow. Take care, and focus on what's important right now.`;
        matchesFound = true;
      } else {
        responseText = "I detected your emergency message, but didn't find any deadlines scheduled for today. I haven't modified your timetable.";
        matchesFound = true;
      }
    }

    // Generic Default Fallback
    if (!matchesFound) {
      responseText = "I heard you! For offline local mode, please try phrasing your request like: 'postpone all tasks by 2 days', 'move CS401 by 3 days', or 'today my plan changed due to emergency'. To use fully general AI planning, toggle 'Gemini' and add your API key.";
    } else {
      rearrangeTasks(updatedTasks);
      triggerFlashAnimation();
    }

    return responseText;
  };

  // --- GEMINI API DYNAMIC SCHEDULER ENGINE ---
  const handleGeminiReschedule = async (userText) => {
    if (!apiKey) {
      throw new Error("No Gemini API key found. Please enter your API key to activate the Gemini planner.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Model failover chain (gemini-3.5-flash has lower load/spikes, fall back to gemini-2.5-flash)
    const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash'];
    let lastError = null;
    let outputText = '';

    const localToday = format(new Date(), 'yyyy-MM-dd');
    const systemInstruction = `
      You are the backend AI scheduler agent for "Acadesk", a premium academic deadline planner.
      Your task is to parse the user's natural language request (which may ask to reschedule, add, or delete tasks) and return the updated task list in JSON format.
      
      You must respond ONLY with a JSON object of this format:
      {
        "tasks": [
          {
            "id": "task_id_here",
            "title": "task_title_here",
            "course": "course_code_here",
            "date": "ISO_8601_date_string_here",
            "type": "task_type_here",
            "group": "task_group_here"
          }
        ],
        "explanation": "A user-friendly, empathetic explanation of what changes you made, highlighting specific tasks you rescheduled, added, or deleted, and why."
      }
      
      Rules:
      1. Today's current LOCAL date in the user's timezone is ${localToday}. Use this exact date as the reference point for terms like "today", "tomorrow", "this Friday", "next week".
      2. If a task is scheduled for "today", its date must start with exactly "${localToday}" (e.g. "${localToday}T12:00:00"). If scheduled for "tomorrow", it must start with tomorrow's date string, and so on.
      3. Time Parsing: If the user mentions a specific time for a task (e.g. "at 2:30 PM", "by 16:00", "at 9 in the morning"), you MUST set the time portion of that task's date string to match that exact time in 24-hour format (e.g., "T14:30:00", "T16:00:00", "T09:00:00"). If no time is specified, default to "T12:00:00" (noon).
      4. If the user wants to add/create a new task, generate a unique random string starting with "task_" (e.g. "task_k7d3x2") as its ID, and populate all fields (title, course, date, type, group). Add it to the tasks array while keeping other tasks.
      5. If the user wants to delete a task, omit it from the tasks list entirely.
      6. If the user wants to reschedule, update the "date" field. Keep all other fields (id, title, course, type, group) exactly the same.
      7. If the request does not specify task operations, or if no tasks need to change, return the original tasks list unchanged, and explain why in the "explanation" field.
    `;

    const promptText = `
      Current Tasks List:
      ${JSON.stringify(tasks, null, 2)}
      
      User Request:
      "${userText}"
    `;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Gemini scheduling with model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: systemInstruction + "\n\n" + promptText }] }
          ]
        });

        const response = await result.response;
        outputText = response.text();
        lastError = null;
        break; // Success! Stop trying other models
      } catch (err) {
        console.warn(`Model ${modelName} failed, trying next...`, err);
        lastError = err;
      }
    }

    if (lastError) {
      throw new Error(`Gemini API is busy. Please try again in a few seconds. (Detail: ${lastError.message})`);
    }
    
    // Robustly parse the structured JSON output (stripping markdown code blocks if present)
    let cleanText = outputText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '');
      cleanText = cleanText.replace(/\n?```$/, '');
    }
    
    const parsedData = JSON.parse(cleanText.trim());
    
    if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
      await rearrangeTasks(parsedData.tasks);
      triggerFlashAnimation();
      return parsedData.explanation;
    } else {
      throw new Error("Invalid response format from Gemini model.");
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setChatLog(prev => [...prev, { sender: 'user', text: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      let aiResponseText = '';
      if (mode === 'gemini') {
        aiResponseText = await handleGeminiReschedule(userMessage);
      } else {
        // Mock a brief thinking delay for offline mode so it feels premium!
        await new Promise(resolve => setTimeout(resolve, 800));
        aiResponseText = handleLocalReschedule(userMessage);
      }
      setChatLog(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
    } catch (err) {
      setChatLog(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: `Error: ${err.message || "Failed to process request."}`,
          isError: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Inline API Key Activation
  const handleActivateApiKey = (e) => {
    e.preventDefault();
    const cleanKey = inputApiKey.trim();
    if (cleanKey) {
      localStorage.setItem('sync_gemini_api_key', cleanKey);
      setApiKey(cleanKey);
      setInputApiKey('');
      setMode('gemini');
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col flex-grow relative overflow-hidden">
      
      {/* Glow aura inside the AI panel */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl ai-pulse pointer-events-none"></div>

      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Acadesk AI</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Schedule Assistant</span>
          </div>
        </div>

        {/* Local vs Gemini toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 text-[11px] font-bold">
          <button
            onClick={() => setMode('local')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${mode === 'local' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Zap size={11} />
            Local
          </button>
          <button
            onClick={() => setMode('gemini')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${mode === 'gemini' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Bot size={11} />
            Gemini
          </button>
        </div>
      </div>

      {/* Inline API Key Activation Card if in Gemini mode but no key is set */}
      {mode === 'gemini' && !apiKey ? (
        <div className="flex-grow flex flex-col justify-center py-4 px-2">
          <div className="bg-gradient-to-tr from-blue-50/70 to-indigo-50/70 border border-blue-100 p-5 rounded-2xl text-center space-y-4 run-zoom relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
            
            <div className="mx-auto w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Key size={18} />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800">Activate Gemini AI</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Connect your Gemini API key to unlock DeepMind-style smart rescheduling, addition, and deletion of your deadlines.
              </p>
            </div>

            <form onSubmit={handleActivateApiKey} className="space-y-2.5 max-w-sm mx-auto">
              <input
                type="password"
                placeholder="Paste API Key here (AIzaSy...)"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-xs rounded-xl shadow-inner text-center"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Activate AI Mode
              </button>
            </form>

            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-bold transition hover:underline"
            >
              Get a free API Key from Google AI Studio
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Log Window */}
          <div className="flex-grow overflow-y-auto max-h-[280px] min-h-[160px] space-y-3.5 pr-1 mb-4 scrollbar-thin">
            {chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-2.5 ${chat.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {chat.sender === 'ai' && (
                  <div className={`p-1.5 rounded-lg shrink-0 ${chat.isError ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Bot size={16} />
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] font-medium ${
                    chat.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none ml-auto shadow-sm shadow-blue-500/10' 
                      : chat.isError 
                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none' 
                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {chat.text}
                </div>
                {chat.sender === 'user' && !loading && (
                  <button
                    onClick={() => setPrompt(chat.text)}
                    className="self-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100/80 rounded-lg transition duration-200"
                    title="Edit and resubmit prompt"
                  >
                    <Pencil size={11} />
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 animate-bounce">
                  <Bot size={16} />
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  AI is planning...
                </div>
              </div>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="relative mt-auto flex items-center gap-2">
            <input
              type="text"
              placeholder={mode === 'gemini' ? "Move today's exam to tomorrow..." : "postpone CS401 by 2 days..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-11 py-3.5 bg-slate-50/80 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-xs font-semibold rounded-2xl transition-all"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-md shadow-blue-500/10"
            >
              <Send size={14} />
            </button>
          </form>
        </>
      )}

    </section>
  );
}
