import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarClock,
  Timer,
  Calendar,
  Target,
  BookOpen,
  ClipboardCheck,
  BarChart2,
  Layers,
  Bot,
  Award,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Habits', path: '/habits', icon: CheckSquare },
  { name: 'Daily Planner', path: '/planner', icon: CalendarClock },
  { name: 'Focus Mode', path: '/focus', icon: Timer },
  { name: 'Calendar & Heatmap', path: '/calendar', icon: Calendar },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Daily Reflection', path: '/reflection', icon: BookOpen },
  { name: 'Weekly Review', path: '/weekly-review', icon: ClipboardCheck },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Rules & Stacks', path: '/rules-and-stacks', icon: Layers },
  { name: 'JARVIS Coach', path: '/jarvis', icon: Bot, badge: 'AI' },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();

  const navContent = (
    <div className="flex flex-col h-full py-4">
      {/* Loop Principles Callout in Sidebar */}
      <div className="px-4 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20">
          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Discipline Loop</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Plan → Act → Track → Reflect → Adjust → Repeat
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && !isActive && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Philosophy Footnote */}
      <div className="px-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        Consistency &gt; Perfection
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                DisciplineOS Menu
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
