import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Shield,
  Lock,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [wakeTime, setWakeTime] = useState(user?.preferences?.preferredWakeTime || '06:30');
  const [sleepTime, setSleepTime] = useState(user?.preferences?.preferredSleepTime || '23:00');
  const [productivityHours, setProductivityHours] = useState(
    user?.preferences?.productivityHours || 'morning'
  );
  const [notificationLevel, setNotificationLevel] = useState(
    user?.preferences?.notificationLevel || 'normal'
  );
  const [scoreEnabled, setScoreEnabled] = useState(
    user?.preferences?.disciplineScoreEnabled !== false
  );

  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        name,
        preferences: {
          theme,
          preferredWakeTime: wakeTime,
          preferredSleepTime: sleepTime,
          productivityHours,
          notificationLevel,
          disciplineScoreEnabled: scoreEnabled,
        },
      });
      if (res.success) {
        updateUser(res.data);
        toastSuccess('Profile & preferences updated');
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toastSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toastError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Type "DELETE" to permanently erase your DisciplineOS account and all associated habit data:'
    );
    if (confirmation !== 'DELETE') return;

    try {
      await authService.deleteAccount();
      toastSuccess('Account deleted');
      await logout();
      navigate('/');
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account &amp; System Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your biological rhythm, visual theme, notifications, and credentials.
        </p>
      </div>

      {/* Profile & Rhythm Preferences */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Profile &amp; Rhythm
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Theme selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    theme === t
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Wake & Sleep Rhythm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Discipline Score Toggle */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mt-2">
            <input
              type="checkbox"
              id="scoreEnabled"
              checked={scoreEnabled}
              onChange={(e) => setScoreEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="scoreEnabled" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <span className="font-semibold">Enable Daily Discipline Score:</span> Show behavioral momentum index on home dashboard.
            </label>
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="primary" size="md" type="submit" isLoading={savingProfile} icon={Save}>
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Security &amp; Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="md" type="submit" isLoading={savingPassword} icon={Lock}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 md:p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Danger Zone: Delete Account
          </h2>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
            Permanently erase all habit logs, focus sessions, reflection journals, and goals. This cannot be undone.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={handleDeleteAccount}
          className="whitespace-nowrap"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};
