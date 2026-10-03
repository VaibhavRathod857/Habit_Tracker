import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const RecoveryBanner = ({ recoveryMode, onComplete }) => {
  if (!recoveryMode?.active) return null;

  return (
    <div className="rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 shadow-sm animate-fade-in mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 mt-0.5">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
              Recovery Mode Active (-{recoveryMode.targetReductionPct}% Target Reduction)
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
              Your habit targets have been temporarily halved. Showing up and initiating the routine matters infinitely more than hitting intense metrics right now.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onComplete}
          className="whitespace-nowrap bg-white dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
        >
          Restore Standard Targets
        </Button>
      </div>
    </div>
  );
};
