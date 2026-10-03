import React, { useState, useEffect } from 'react';
import { X, Settings, Sparkles, Sliders, Volume2, Shield } from 'lucide-react';
import { jarvisService } from '../../services/jarvisService.js';
import { useToast } from '../../context/ToastContext.jsx';

export const JarvisSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    personality: 'calm',
    responseLength: 'normal',
    proactiveInsights: true,
    memoryEnabled: true,
    voiceEnabled: false,
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      jarvisService.getSettings().then((res) => {
        if (res) setSettings(res);
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await jarvisService.updateSettings(settings);
      addToast('JARVIS settings updated', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              JARVIS Coaching Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Personality */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
              Coaching Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'calm', label: 'Calm', desc: 'Patient, balanced, steady' },
                { id: 'direct', label: 'Direct', desc: 'Concise, high-impact, direct' },
                { id: 'encouraging', label: 'Supportive', desc: 'Positive, empathetic' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, personality: p.id })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    settings.personality === p.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="capitalize">{p.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Response Length */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
              Response Depth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'short', label: 'Concise', desc: 'Action-first bullet points' },
                { id: 'normal', label: 'Standard', desc: 'Balanced reasoning' },
                { id: 'detailed', label: 'Detailed', desc: 'In-depth behavioral analysis' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, responseLength: r.id })}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    settings.responseLength === r.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div>{r.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Proactive Insights */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Proactive Insights
                </span>
                <span className="text-[11px] text-slate-400">
                  Allow JARVIS to recommend actions on dashboard
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.proactiveInsights !== false}
                onChange={(e) =>
                  setSettings({ ...settings, proactiveInsights: e.target.checked })
                }
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </div>

            {/* Memory & Personalization */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Memory & Personalization
                </span>
                <span className="text-[11px] text-slate-400">
                  Retain stable preferences across conversations
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.memoryEnabled !== false}
                onChange={(e) =>
                  setSettings({ ...settings, memoryEnabled: e.target.checked })
                }
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
