import React from 'react';
import { Play, Plus, CalendarClock, BookOpen, ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const QuickActionsBar = ({
  onStartFocus,
  onAddHabit,
  onOpenPlanner,
  onOpenReflection,
  onToggleBadDay,
  onOpenRecovery,
  badDayActive,
  recoveryActive,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Button
        variant="primary"
        size="sm"
        icon={Play}
        onClick={onStartFocus}
      >
        Start Focus
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={Plus}
        onClick={onAddHabit}
      >
        Add Habit
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={CalendarClock}
        onClick={onOpenPlanner}
      >
        Plan Today
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={BookOpen}
        onClick={onOpenReflection}
      >
        Daily Review
      </Button>

      <Button
        variant={badDayActive ? 'danger' : 'outline'}
        size="sm"
        icon={ShieldAlert}
        onClick={onToggleBadDay}
      >
        {badDayActive ? 'Exit Bad Day' : 'Bad Day Mode'}
      </Button>

      <Button
        variant={recoveryActive ? 'recovery' : 'outline'}
        size="sm"
        icon={RotateCcw}
        onClick={onOpenRecovery}
      >
        {recoveryActive ? 'Recovery Active' : 'Recovery Mode'}
      </Button>
    </div>
  );
};
