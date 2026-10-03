import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import { JarvisAvatar } from './JarvisAvatar.jsx';
import { JarvisChat } from './JarvisChat.jsx';

export const JarvisFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide floating launcher on the main /jarvis or /ai-coach page to avoid duplication
  if (location.pathname === '/jarvis' || location.pathname === '/ai-coach') {
    return null;
  }

  // Only show for authenticated pages
  if (['/', '/login', '/register', '/forgot-password', '/reset-password', '/onboarding'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#0c162d] to-[#070b16] border border-cyan-500/40 text-white shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105"
          title="Open JARVIS AI Coach"
        >
          {/* Subtle glowing ring pulse */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity" />

          <div className="relative flex items-center gap-2">
            <JarvisAvatar size="sm" />
            <span className="text-xs font-bold tracking-wide hidden sm:inline text-cyan-300 group-hover:text-white transition-colors">
              JARVIS
            </span>
          </div>
        </button>
      </div>

      {/* Slide-over Quick Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg h-full bg-white dark:bg-[#070b16] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in-right"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <JarvisAvatar size="sm" />
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    JARVIS AI Coach
                  </h3>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400">
                    Discipline & Routine Assistant
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/jarvis');
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                >
                  Full View
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Live Chat */}
            <div className="flex-1 min-h-0">
              <JarvisChat />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
