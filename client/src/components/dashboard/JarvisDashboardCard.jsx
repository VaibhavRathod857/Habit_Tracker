import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, MessageSquare, CheckCircle2 } from 'lucide-react';
import { JarvisAvatar } from '../jarvis/JarvisAvatar.jsx';
import { jarvisService } from '../../services/jarvisService.js';
import { useToast } from '../../context/ToastContext.jsx';

export const JarvisDashboardCard = () => {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      const data = await jarvisService.getDashboardCard();
      setCardData(data);
    } catch (err) {
      // Quiet fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!cardData) return;

    if (cardData.actionType === 'send_reply') {
      navigate('/jarvis');
      return;
    }

    if (cardData.actionType === 'start_focus') {
      setExecuting(true);
      try {
        await jarvisService.executeAction({
          actionType: 'start_focus',
          payload: cardData.payload,
        });
        addToast('Focus session started!', 'success');
        navigate('/focus');
      } catch (err) {
        addToast(err.message || 'Failed to start session', 'error');
      } finally {
        setExecuting(false);
      }
    }
  };

  if (loading || !cardData) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent p-4 md:p-5 shadow-sm">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Guidance */}
        <div className="flex items-start gap-3.5">
          <JarvisAvatar size="lg" className="mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                JARVIS Live Recommendation
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
                AI Coach
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-0.5">
              {cardData.headline}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              "{cardData.advice}"
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0 sm:self-center">
          {cardData.actionLabel && (
            <button
              type="button"
              disabled={executing}
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {executing ? (
                <span>Starting...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{cardData.actionLabel}</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/jarvis')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
            <span>Ask JARVIS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
