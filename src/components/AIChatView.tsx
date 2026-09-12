import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  User as UserIcon,
  Copy,
  Check,
  Share2,
  Mic,
  Square,
  ChevronDown,
  Zap,
  Brain,
  MessageSquareText,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { ChatMessage, AIRolePreset } from '../types';
import { blobToBase64 } from '../utils/audioUtils';

const ROLE_PRESETS: AIRolePreset[] = [
  {
    id: 'coach',
    name: 'Creator Coach',
    tagline: 'Audience growth, viral hooks & strategy',
    iconName: 'Sparkles',
    systemInstruction:
      'You are Wavelink Creator Coach, an elite social media strategist and community builder. Help creators brainstorm content, design high-engagement hooks, grow their following ethically, and write authentic posts.',
    suggestedPrompts: [
      'Give me 3 viral hooks for a post about creative burnout',
      'How can I convert passive lurkers into active commenters?',
      'Draft a 5-step content strategy for a new tech creator on Wavelink'
    ]
  },
  {
    id: 'copywriter',
    name: 'Viral Copywriter',
    tagline: 'Punchy captions, threads & storytelling',
    iconName: 'MessageSquareText',
    systemInstruction:
      'You are Wavelink Master Copywriter. You write irresistible social media posts, evocative micro-stories, witty one-liners, and structured threads with rhythm, clarity, and emotional resonance.',
    suggestedPrompts: [
      'Write a captivating post about taking a leap of faith in your career',
      'Turn this sentence into a witty punchline for my feed: "Coffee is my only coworker"',
      'Draft an interactive question post that gets hundreds of replies'
    ]
  },
  {
    id: 'analyst',
    name: 'Deep Thinker',
    tagline: 'Complex reasoning, research & tech breakdown',
    iconName: 'Brain',
    systemInstruction:
      'You are Wavelink Deep Thinker, an advanced analytical researcher and technical advisor. Provide thorough, nuanced, structured analyses, comprehensive step-by-step reasoning, and insightful critiques.',
    suggestedPrompts: [
      'Explain the architectural trade-offs of WebSockets vs Server-Sent Events',
      'Analyze the cultural impact of algorithmic feeds on human attention spans',
      'Deconstruct the economics of modern creator monetization platforms'
    ]
  },
  {
    id: 'companion',
    name: 'Friendly Companion',
    tagline: 'Warm conversations, ideas & reflections',
    iconName: 'Bot',
    systemInstruction:
      'You are Wavelink Companion, a warm, thoughtful, and empathetic friend. You celebrate wins, offer encouragement, discuss interesting ideas, books, and daily life experiences.',
    suggestedPrompts: [
      'What are some small habits that brought you joy recently?',
      'I had a busy week and need some calming words of encouragement',
      'Recommend three inspiring books on creativity and human connection'
    ]
  }
];

const STORAGE_CHAT_KEY = 'wavelink_ai_chat_history_v1';

export const AIChatView: React.FC = () => {
  const { currentUser, addPost, setActiveTab } = useSocial();

  // Selected model: gemini-3.5-flash (general), gemini-3.1-flash-lite (fast), gemini-3.1-pro-preview (complex)
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'
  >('gemini-3.5-flash');

  // Role preset
  const [selectedRole, setSelectedRole] = useState<AIRolePreset>(ROLE_PRESETS[0]);
  const [customRoleInstruction, setCustomRoleInstruction] = useState<string>('');
  const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);

  // Chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'welcome_1',
        role: 'model',
        text: "Hello! I'm Wavelink AI. I'm equipped with Gemini models to help you brainstorm ideas, refine posts, reason through complex topics, or chat about anything on your mind. How can I assist you today?",
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-3.5-flash',
        rolePreset: 'Creator Coach'
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [postedId, setPostedId] = useState<string | null>(null);

  // Voice recording for chat input using gemini-3.5-transcribe
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeSystemInstruction = isCustomRole
    ? customRoleInstruction.trim() || selectedRole.systemInstruction
    : selectedRole.systemInstruction;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Format messages history for multi-turn server endpoint
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          systemInstruction: activeSystemInstruction
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelReply = data.reply || 'No response generated.';

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: modelReply,
        timestamp: new Date().toISOString(),
        modelUsed: data.model || selectedModel,
        rolePreset: isCustomRole ? 'Custom Persona' : selectedRole.name
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err?.message || 'Failed to get a response from Gemini. Please check your network and API credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear entire chat history?')) {
      const resetList: ChatMessage[] = [
        {
          id: `welcome_${Date.now()}`,
          role: 'model',
          text: `Chat cleared! I'm now acting as your ${
            isCustomRole ? 'Custom Persona' : selectedRole.name
          }. What would you like to explore?`,
          timestamp: new Date().toISOString(),
          modelUsed: selectedModel,
          rolePreset: isCustomRole ? 'Custom Persona' : selectedRole.name
        }
      ];
      setMessages(resetList);
      localStorage.removeItem(STORAGE_CHAT_KEY);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePostToFeed = (id: string, text: string) => {
    addPost(text, undefined, ['WavelinkAI', 'AIInsight'], 'public');
    setPostedId(id);
    setTimeout(() => {
      setPostedId(null);
      setActiveTab('feed');
    }, 1200);
  };

  // Mic dictation for chat using gemini-3.5-transcribe
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: audioBlob.type || 'audio/webm',
              prompt: 'Transcribe this spoken dictation cleanly for a chat message.'
            })
          });

          const data = await res.json();
          if (data.text) {
            setInputMessage((prev) => (prev ? `${prev} ${data.text}` : data.text));
          } else if (data.error) {
            setErrorMessage(data.error);
          }
        } catch (e: any) {
          setErrorMessage('Transcription error: ' + (e?.message || 'Failed'));
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setErrorMessage('Microphone permission denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-white">
      {/* Header Bar */}
      <div className="p-4 border-b border-zinc-200/80 bg-white sticky top-0 z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">Wavelink AI</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Gemini
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {isCustomRole ? 'Custom Persona' : selectedRole.name} • {selectedRole.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear conversation"
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Model Selector & Role Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100">
          {/* Model pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
            <button
              id="model-gemini-3-5-flash"
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="gemini-3.5-flash: Ideal for general conversation & tasks"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>gemini-3.5-flash</span>
              <span className="hidden lg:inline text-[10px] text-zinc-400 font-normal">(General)</span>
            </button>

            <button
              id="model-gemini-3-1-flash-lite"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="gemini-3.1-flash-lite: Optimized for rapid, fast responses"
            >
              <Zap className="w-3 h-3 text-emerald-500" />
              <span>gemini-3.1-flash-lite</span>
              <span className="hidden lg:inline text-[10px] text-zinc-400 font-normal">(Fast)</span>
            </button>

            <button
              id="model-gemini-3-1-pro-preview"
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="gemini-3.1-pro-preview: Deep reasoning for complex tasks"
            >
              <Brain className="w-3 h-3 text-indigo-500" />
              <span>gemini-3.1-pro</span>
              <span className="hidden lg:inline text-[10px] text-zinc-400 font-normal">(Complex)</span>
            </button>
          </div>

          {/* Role selector dropdown button */}
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl text-xs font-semibold text-zinc-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            <span>Role: {isCustomRole ? 'Custom' : selectedRole.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleSelector ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Role Drawer */}
        {showRoleSelector && (
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3 mt-1 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-zinc-900 flex items-center justify-between">
              <span>Select System Instruction Role:</span>
              <button
                onClick={() => setShowRoleSelector(false)}
                className="text-[11px] text-indigo-600 hover:underline"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_PRESETS.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setIsCustomRole(false);
                  }}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    !isCustomRole && selectedRole.id === role.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold text-zinc-900">{role.name}</div>
                  <div className="text-[11px] text-zinc-500">{role.tagline}</div>
                </button>
              ))}
            </div>

            {/* Custom instruction toggle */}
            <div className="pt-2 border-t border-zinc-200/60">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomRole}
                  onChange={(e) => setIsCustomRole(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Define custom system instruction</span>
              </label>

              {isCustomRole && (
                <textarea
                  value={customRoleInstruction}
                  onChange={(e) => setCustomRoleInstruction(e.target.value)}
                  placeholder="e.g. You are a passionate science journalist who translates astrophysics into simple metaphors..."
                  rows={2}
                  className="w-full mt-2 p-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-4 my-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Messages Scrollable Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[85%] sm:max-w-[75%] space-y-2 ${
                  isUser
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-zinc-100 text-zinc-900 rounded-tl-none border border-zinc-200/70'
                }`}
              >
                {/* Meta header for bot */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-200/50 text-[10px] text-zinc-500">
                    <span className="font-semibold text-zinc-700">{msg.rolePreset || 'Wavelink AI'}</span>
                    {msg.modelUsed && (
                      <span className="bg-zinc-200/80 px-1.5 py-0.5 rounded font-mono text-[9px] text-zinc-600">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px]">{msg.text}</div>

                {/* Action buttons on bot messages */}
                {!isUser && (
                  <div className="pt-2 flex items-center gap-2 border-t border-zinc-200/50 text-[11px] text-zinc-500">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-zinc-900 flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handlePostToFeed(msg.id, msg.text)}
                      className="hover:text-indigo-600 flex items-center gap-1 transition-colors ml-2"
                      title="Post this to Wavelink Feed"
                    >
                      {postedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Posted to feed!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3 h-3" />
                          <span>Post to Feed</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-zinc-100 rounded-2xl rounded-tl-none p-3.5 border border-zinc-200/70 flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="font-medium">Thinking with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50/50 flex flex-wrap gap-1.5">
          {selectedRole.suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-full px-3 py-1 transition-colors text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3 sm:p-4 border-t border-zinc-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          {/* Voice dictation button using gemini-3.5-transcribe */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title={
              isRecording
                ? 'Stop recording'
                : 'Dictate message with microphone (transcribed by gemini-3.5-transcribe)'
            }
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to microphone...'
                : isTranscribing
                ? 'Transcribing audio with gemini-3.5-transcribe...'
                : `Ask ${isCustomRole ? 'Custom Persona' : selectedRole.name}...`
            }
            disabled={isLoading || isRecording || isTranscribing}
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full focus:outline-hidden transition-all placeholder-zinc-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center shadow-xs ${
              inputMessage.trim() && !isLoading
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 px-3 pt-1.5">
          <span>Active model: {selectedModel}</span>
          <span>Role: {isCustomRole ? 'Custom Persona' : selectedRole.name}</span>
        </div>
      </div>
    </div>
  );
};
