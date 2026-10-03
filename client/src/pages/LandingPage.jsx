import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Flame,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Timer,
  Calendar,
  Brain,
  ArrowRight,
  ShieldAlert,
  Sliders,
  ChevronDown,
  Layers,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export const LandingPage = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await login('demo@disciplineos.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  const FAQS = [
    {
      q: 'How is DisciplineOS different from a typical habit tracker?',
      a: 'Most habit trackers treat discipline as a binary streak: miss one day, and you feel like a failure. DisciplineOS is engineered around human psychology. We track long-term consistency percentage, provide one-click Recovery Mode, offer a Bad Day Mode when survival is priority, and use AI/data to suggest lowering friction when a target is unrealistically high.',
    },
    {
      q: 'What is Recovery Mode?',
      a: 'If you miss two or three days in a row, instead of abandoning your habits, Recovery Mode temporarily cuts targets by 50% for 3 days. It gives you immediate low-friction wins to reignite momentum before restoring standard targets.',
    },
    {
      q: 'Can I track habits with actual numbers (like 45 minutes of DSA or 15 pages)?',
      a: 'Yes! Every habit supports binary (yes/no), minutes, hours, pages, reps, kilometers, or custom units with granular progress percentages and visual progress bars.',
    },
    {
      q: 'Is my data private and secure?',
      a: 'Absolutely. DisciplineOS utilizes bcrypt salted password hashing, JWT authentication, isolated user databases, and Helmet security protection. Your habits and reflections are strictly your own.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b16] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <span className="font-extrabold text-base tracking-tighter">OS</span>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Discipline<span className="text-brand-500">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5"
            >
              Sign In
            </Link>
            <Button
              variant="secondary"
              size="sm"
              isLoading={demoLoading}
              onClick={handleDemoLogin}
              className="hidden sm:inline-flex"
            >
              Try Live Demo
            </Button>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Not just another habit tracker — A complete consistency operating system</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Build discipline. <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
              One day at a time.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Plan your days, build high-impact habits, stay in deep focus, understand your distraction patterns, and recover smoothly when life gets in the way.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/20">
                Get Started Free
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              isLoading={demoLoading}
              onClick={handleDemoLogin}
              className="w-full sm:w-auto px-8"
            >
              Explore Live Demo (Seeded Data)
            </Button>
          </div>

          {/* Philosophy Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Consistency &gt; Perfection
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-500" /> Recovery &gt; Guilt
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" /> Small Wins &gt; Overwhelm
            </span>
          </div>
        </div>
      </section>

      {/* The Central Discipline Loop */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              The Architecture of Momentum
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The DisciplineOS Feedback Loop
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Discipline is not an innate trait you are born with. It is an operating loop you execute repeatedly.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            {[
              { step: '01', title: 'PLAN', desc: 'Time-block non-negotiable tasks and habits.', color: 'border-blue-500/30' },
              { step: '02', title: 'ACT', desc: 'Enter deep Pomodoro focus without cognitive clutter.', color: 'border-indigo-500/30' },
              { step: '03', title: 'TRACK', desc: 'Log actual numerical progress with mood context.', color: 'border-brand-500/30' },
              { step: '04', title: 'REFLECT', desc: 'Pinpoint friction and recurring distractions.', color: 'border-purple-500/30' },
              { step: '05', title: 'ADJUST', desc: 'Lower target resistance or activate Recovery Mode.', color: 'border-amber-500/30' },
              { step: '06', title: 'REPEAT', desc: 'Watch your 365-day consistency rate compound.', color: 'border-emerald-500/30' },
            ].map((s) => (
              <div
                key={s.title}
                className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border ${s.color} flex flex-col justify-between`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-400">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white my-1">{s.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Engineered For Real Life
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Everything You Need To Master Consistency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Gentle Recovery Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Missed 3 days due to sickness or travel? Rather than resetting to zero in shame, Recovery Mode halves habit targets for 3 days to gently restart your momentum.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Bad Day Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Having an exhausting day? Hit one button. High-friction demands vanish; only survival baselines (drink water, walk 5m, rest) remain. Zero guilt.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Deep Work Pomodoro Timer
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Full distraction-free timer with synthesized completion chime, distraction counter, and automatic direct contribution to your habit progress logs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Adaptive Habit Suggestions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              When a target is consistently missed over 7 days, the system gently proposes reducing friction (e.g. 60m → 30m) so you rebuild ease before scaling up.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Data-Grounded AI Coach
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyzes actual completed logs, energy dips, and reported distractions. Delivers actionable feedback with clear rationale without generic filler.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              365-Day Consistency Heatmap
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              GitHub-style contribution grid capturing every habit completion, focus block, and reflection note over the entire year with interactive day inspection.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-slate-900 dark:text-slate-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Ready to upgrade your lifestyle?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Stop restarting every Monday. Build an antifragile routine designed to survive reality.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight} className="px-8 shadow-lg shadow-brand-500/25">
                Create Free Account
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              isLoading={demoLoading}
              onClick={handleDemoLogin}
            >
              Sign In As Demo User
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 DisciplineOS. Built with precision for sustainable human high performance.</p>
      </footer>
    </div>
  );
};
