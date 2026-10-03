import React, { useState, useEffect } from 'react';
import { X, Trash2, Brain, Shield, Pin, Check } from 'lucide-react';
import { jarvisService } from '../../services/jarvisService.js';
import { useToast } from '../../context/ToastContext.jsx';

export const JarvisMemoryModal = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, setRes] = useState(await jarvisService.getMemories());
      const settings = await jarvisService.getSettings();
      setMemories(memRes || []);
      setMemoryEnabled(settings?.memoryEnabled !== false);
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await jarvisService.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
      addToast('Memory item removed', 'success');
    } catch (err) {
      addToast('Failed to delete memory', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all JARVIS memory?')) return;
    try {
      await jarvisService.clearAllMemories();
      setMemories([]);
      addToast('All JARVIS memory cleared', 'success');
    } catch (err) {
      addToast('Failed to clear memories', 'error');
    }
  };

  const handleTogglePersonalization = async () => {
    const newState = !memoryEnabled;
    setMemoryEnabled(newState);
    try {
      await jarvisService.updateSettings({ memoryEnabled: newState });
      addToast(
        newState ? 'Personalized memory enabled' : 'Personalized memory disabled',
        'info'
      );
    } catch (err) {
      addToast('Failed to update personalization setting', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                JARVIS Long-Term Memory
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage your stable preferences, goals, and strategies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personalization Toggle */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Personalized Coaching Memory
            </span>
          </div>
          <button
            type="button"
            onClick={handleTogglePersonalization}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              memoryEnabled
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {memoryEnabled ? 'Active' : 'Disabled'}
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading memories...
            </div>
          ) : memories.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No long-term memories stored yet. As you converse with JARVIS about your routines and goals, key takeaways will appear here.
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem._id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {mem.key}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-snug">
                    {mem.value}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(mem._id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center text-xs">
          <button
            type="button"
            disabled={memories.length === 0}
            onClick={handleClearAll}
            className="text-rose-500 hover:text-rose-600 font-medium disabled:opacity-40"
          >
            Clear All Memories
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
