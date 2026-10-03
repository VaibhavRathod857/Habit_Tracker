import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const BadDayBanner = ({ onDeactivate }) => {
  return (
    <div className="rounded-2xl p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 shadow-sm animate-fade-in mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">
              Bad Day Mode Active
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              Today is purely about low friction and survival: drink water, take a 5-minute walk, rest without guilt. Non-essential demands are hidden.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onDeactivate}
          className="whitespace-nowrap bg-white dark:bg-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800"
        >
          Exit Bad Day Mode
        </Button>
      </div>
    </div>
  );
};
