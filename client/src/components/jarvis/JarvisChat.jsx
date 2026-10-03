import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Square,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { JarvisAvatar } from './JarvisAvatar.jsx';
import { JarvisMessageWidgets } from './JarvisMessageWidgets.jsx';
import { jarvisService } from '../../services/jarvisService.js';
import { useToast } from '../../context/ToastContext.jsx';

// Quick shortcuts (for convenient starting points only, not fixed templates)
const QUICK_SHORTCUTS = [
  'Plan my day realistically',
  "I'm procrastinating on studying right now",
  'Why am I struggling with my habits?',
  'What should I do right now?',
  'I wasted the day. How do I recover?',
  'Show my progress and streaks',
  'Help me focus for 25 minutes',
  'I want to wake up at 6 AM',
];

export const JarvisChat = ({
  conversationId = null,
  initialMessages = [],
  clientContext = {},
  onConversationCreated = null,
  className = '',
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [pendingProposals, setPendingProposals] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [executingActionId, setExecutingActionId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText, isStreaming]);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast('Voice input is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!voiceSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`>]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
    addToast('Response copied to clipboard', 'info');
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSend = async (customPrompt = null) => {
    const promptToSend = (customPrompt !== null ? customPrompt : input).trim();
    if (!promptToSend || isStreaming) return;

    setInput('');
    const tempUserMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamedText('');
    setPendingProposals([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';
    const collectedActions = [];

    try {
      await jarvisService.streamMessage({
        conversationId,
        content: promptToSend,
        clientContext,
        signal: controller.signal,
        onToken: (token) => {
          accumulatedText += token;
          setStreamedText(accumulatedText);
        },
        onActionProposal: (action) => {
          collectedActions.push(action);
          setPendingProposals((prev) => [...prev, action]);
        },
        onDone: (data) => {
          setIsStreaming(false);
          setStreamedText('');
          abortControllerRef.current = null;

          if (data?.conversation && onConversationCreated && !conversationId) {
            onConversationCreated(data.conversation);
          }

          if (data?.assistantMessage) {
            setMessages((prev) => [...prev, data.assistantMessage]);
            if (voiceSpeechEnabled) {
              speakText(data.assistantMessage.content);
            }
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setStreamedText('');
          abortControllerRef.current = null;
          addToast(err.message || 'Error communicating with JARVIS', 'error');
        },
      });
    } catch (err) {
      setIsStreaming(false);
      setStreamedText('');
      abortControllerRef.current = null;
      addToast(err.message || 'Failed to stream response', 'error');
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleConfirmAction = async (action, messageId) => {
    setExecutingActionId(action.id);
    try {
      const res = await jarvisService.confirmAction({
        messageId,
        actionId: action.id,
        actionType: action.actionType,
        payload: action.payload,
      });

      addToast(res.message || 'Action executed successfully!', 'success');

      // Update local message action state
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              actions: (m.actions || []).map((a) =>
                a.id === action.id ? { ...a, isExecuted: true } : a
              ),
            };
          }
          return m;
        })
      );

      // If starting focus, redirect to focus timer
      if (action.actionType === 'startFocusSession' || action.actionType === 'start_focus') {
        setTimeout(() => navigate('/focus'), 1200);
      }
    } catch (err) {
      addToast(err.message || 'Failed to execute action', 'error');
    } finally {
      setExecutingActionId(null);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#070b16] relative overflow-hidden ${className}`}>
      {/* Top Bar with Context and Speech Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <JarvisAvatar size="sm" isThinking={isStreaming} />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">JARVIS</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 ml-1.5 font-medium">
              Conversational Coach
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {clientContext?.page && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>Context: {clientContext.page}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setVoiceSpeechEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              voiceSpeechEnabled
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={voiceSpeechEnabled ? 'Mute audio' : 'Enable voice read-aloud'}
          >
            {voiceSpeechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && !isStreaming && (
          <div className="max-w-lg mx-auto text-center py-10">
            <JarvisAvatar size="xl" className="mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Talk to JARVIS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
              Ask about your routine, plan your schedule, conquer procrastination, or analyze habit patterns. I reason over your real data to provide honest, action-oriented guidance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {QUICK_SHORTCUTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-xs font-medium text-slate-700 dark:text-slate-300 group"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Persisted Messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedMessageId === msg.id;

          return (
            <div
              key={msg.id || i}
              className={`flex items-start gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && <JarvisAvatar size="md" />}

              <div className={`max-w-[85%] md:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Markdown text */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.content}
                  </div>

                  {/* Visual Widget if provided */}
                  {!isUser && msg.widget && <JarvisMessageWidgets widget={msg.widget} />}

                  {/* Action confirmation cards */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                      {msg.actions.map((act) => {
                        const isExecuted = act.isExecuted;
                        const isExecuting = executingActionId === act.id;

                        return (
                          <div
                            key={act.id}
                            className="p-2.5 rounded-xl border border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/30 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {act.label || `Execute ${act.actionType}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isExecuted ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  <Check className="w-3.5 h-3.5" /> Executed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isExecuting}
                                  onClick={() => handleConfirmAction(act, msg.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white shadow-sm transition-all"
                                >
                                  {isExecuting ? 'Executing...' : 'Confirm'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message controls (Copy, Timestamp) */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                      title="Copy response"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Message */}
        {isStreaming && (
          <div className="flex items-start gap-3">
            <JarvisAvatar size="md" isThinking={true} />
            <div className="max-w-[85%] md:max-w-[78%] bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-800 dark:text-slate-200 shadow-sm leading-relaxed">
              <div className="whitespace-pre-line space-y-2">
                {streamedText || 'Thinking...'}
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-500 animate-pulse align-middle" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Control Strip during generation (Stop / Regenerate) */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">
            Prompts:
          </span>
          {QUICK_SHORTCUTS.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isStreaming}
              className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-cyan-500 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
          {isStreaming ? (
            <button
              type="button"
              onClick={stopGenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            messages.length > 0 && (
              <button
                type="button"
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b16]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title={isListening ? 'Listening...' : 'Speak to JARVIS'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk naturally to JARVIS (e.g. I studied 20 mins, what next? Why am I failing DSA? Plan my day)..."
            disabled={isStreaming}
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 disabled:opacity-50 text-white font-medium shadow-sm transition-all"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
