import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Sliders,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { JarvisChat } from '../components/jarvis/JarvisChat.jsx';
import { JarvisAvatar } from '../components/jarvis/JarvisAvatar.jsx';
import { JarvisMemoryModal } from '../components/jarvis/JarvisMemoryModal.jsx';
import { JarvisSettingsModal } from '../components/jarvis/JarvisSettingsModal.jsx';
import { jarvisService } from '../services/jarvisService.js';
import { useToast } from '../context/ToastContext.jsx';

export const JarvisPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [search]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await jarvisService.getConversations(search);
      setConversations(data || []);
      // If none selected, default to latest if available
      if (!activeConversationId && data && data.length > 0) {
        selectConversation(data[0].id);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (id) => {
    setActiveConversationId(id);
    setMobileSidebarOpen(false);
    try {
      const res = await jarvisService.getConversation(id);
      if (res && res.messages) {
        setActiveMessages(res.messages);
      }
    } catch (err) {
      addToast('Failed to load conversation history', 'error');
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setActiveMessages([]);
    setMobileSidebarOpen(false);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this coaching session?')) return;

    try {
      await jarvisService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        startNewConversation();
      }
      addToast('Conversation deleted', 'info');
    } catch (err) {
      addToast('Failed to delete conversation', 'error');
    }
  };

  const handleConversationCreated = (newConv) => {
    setActiveConversationId(newConv.id);
    setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b16] overflow-hidden shadow-sm relative">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-80 bg-slate-50 dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <JarvisAvatar size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-wide">
                  JARVIS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 uppercase">
                  Coach
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                Routine, Vision & Discipline
              </p>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Coaching Session</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations found. Start a new session above!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{conv.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {conv.messageCount || 2} messages
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#070b16] space-y-1">
          <button
            type="button"
            onClick={() => setShowMemoryModal(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <Brain className="w-4 h-4 text-cyan-500" />
            <span>Memory & Personalization</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>JARVIS Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#070b16]">
        {/* Mobile Navbar with Sidebar Drawer Toggle */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <JarvisAvatar size="sm" />
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">JARVIS</span>
          </div>
          <button
            type="button"
            onClick={startNewConversation}
            className="p-1.5 rounded-lg text-xs font-medium text-cyan-600 dark:text-cyan-400"
          >
            New Chat
          </button>
        </div>

        <JarvisChat
          conversationId={activeConversationId}
          initialMessages={activeMessages}
          onConversationCreated={handleConversationCreated}
        />
      </div>

      {/* Modals */}
      <JarvisMemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
      />
      <JarvisSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default JarvisPage;
