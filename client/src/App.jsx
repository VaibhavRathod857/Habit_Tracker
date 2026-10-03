import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { AppLayout } from './layouts/AppLayout.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { HabitsPage } from './pages/HabitsPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { FocusPage } from './pages/FocusPage.jsx';
import { CalendarPage } from './pages/CalendarPage.jsx';
import { GoalsPage } from './pages/GoalsPage.jsx';
import { ReflectionPage } from './pages/ReflectionPage.jsx';
import { WeeklyReviewPage } from './pages/WeeklyReviewPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { RulesAndStacksPage } from './pages/RulesAndStacksPage.jsx';
import { AICoachPage } from './pages/AICoachPage.jsx';
import { JarvisPage } from './pages/JarvisPage.jsx';
import { AchievementsPage } from './pages/AchievementsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { JarvisFloatingButton } from './components/jarvis/JarvisFloatingButton.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b16]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding Wizard */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/focus" element={<FocusPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reflection" element={<ReflectionPage />} />
                <Route path="/weekly-review" element={<WeeklyReviewPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/rules-and-stacks" element={<RulesAndStacksPage />} />
                <Route path="/jarvis" element={<JarvisPage />} />
                <Route path="/ai-coach" element={<JarvisPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <JarvisFloatingButton />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
