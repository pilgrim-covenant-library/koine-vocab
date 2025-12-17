'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Target,
  Volume2,
  Trash2,
  Download,
  Upload,
  Check,
  AlertCircle,
  Users,
  Link as LinkIcon,
  Unlink,
  LogOut,
  LogIn,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUserStore, SRS_PRESETS, type SRSMode } from '@/stores/userStore';
import { SEMANTIC_CATEGORIES, PART_OF_SPEECH_INFO, type SemanticCategory, type PartOfSpeech } from '@/types';
import { useAuthStore, isFirebaseAvailable } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { dailyGoal, setDailyGoal, sessionLength, setSessionLength, stats, progress, srsMode, setSrsMode, selectedTiers, setSelectedTiers, selectedPOS, setSelectedPOS, selectedCategories, setSelectedCategories } = useUserStore();
  const { user, signOut, linkToTeacher, unlinkFromTeacher, isLoading: authLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [localDailyGoal, setLocalDailyGoal] = useState(dailyGoal);
  const [localSessionLength, setLocalSessionLength] = useState(sessionLength);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load audio preference from localStorage
    const savedAudio = localStorage.getItem('koine-audio-enabled');
    if (savedAudio !== null) {
      setAudioEnabled(savedAudio === 'true');
    }
  }, []);

  const handleLinkToTeacher = async () => {
    if (!teacherIdInput.trim()) {
      setLinkError('Please enter a teacher ID');
      return;
    }

    setIsLinking(true);
    setLinkError(null);
    try {
      await linkToTeacher(teacherIdInput.trim());
      setTeacherIdInput('');
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'Failed to link to teacher');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkFromTeacher = async () => {
    try {
      await unlinkFromTeacher();
    } catch (error) {
      console.error('Error unlinking:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDailyGoalChange = (value: number) => {
    setLocalDailyGoal(value);
    setDailyGoal(value);
  };

  const handleSessionLengthChange = (value: number) => {
    setLocalSessionLength(value);
    setSessionLength(value);
  };

  const handleAudioToggle = () => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    localStorage.setItem('koine-audio-enabled', String(newValue));
  };

  const handleExportData = () => {
    const data = {
      stats,
      progress,
      dailyGoal,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koine-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success feedback
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the imported data structure
        if (!data.stats || !data.progress) {
          throw new Error('Invalid backup file format. Missing required fields.');
        }

        // Validate stats structure
        const requiredStatsFields = ['xp', 'level', 'streak', 'totalReviews'];
        for (const field of requiredStatsFields) {
          if (typeof data.stats[field] !== 'number') {
            throw new Error(`Invalid stats format: missing or invalid '${field}'`);
          }
        }

        // Get current localStorage data
        const currentData = localStorage.getItem('koine-user-store');
        const currentState = currentData ? JSON.parse(currentData) : {};

        // Merge imported data with current state
        const newState = {
          ...currentState,
          state: {
            ...currentState.state,
            stats: {
              ...currentState.state?.stats,
              ...data.stats,
            },
            progress: {
              ...currentState.state?.progress,
              ...data.progress,
            },
          },
        };

        // If dailyGoal is in the import, update it too
        if (typeof data.dailyGoal === 'number') {
          newState.state.dailyGoal = data.dailyGoal;
        }

        // Save to localStorage
        localStorage.setItem('koine-user-store', JSON.stringify(newState));

        setImportStatus('success');
        setImportError(null);

        // Reload after 1.5 seconds to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        setImportStatus('error');
        setImportError(error instanceof Error ? error.message : 'Failed to import data');
        // Reset status after 3 seconds
        setTimeout(() => {
          setImportStatus('idle');
          setImportError(null);
        }, 3000);
      }
    };

    reader.onerror = () => {
      setImportStatus('error');
      setImportError('Failed to read file');
      setTimeout(() => {
        setImportStatus('idle');
        setImportError(null);
      }, 3000);
    };

    reader.readAsText(file);

    // Reset file input so the same file can be selected again
    event.target.value = '';
  };

  const handleResetProgress = () => {
    localStorage.removeItem('koine-user-store');
    window.location.reload();
  };

  if (!mounted) {
    return <SettingsSkeleton />;
  }

  const dailyGoalOptions = [5, 10, 15, 20, 30, 50];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme selection">
                <button
                  onClick={() => setTheme('light')}
                  role="radio"
                  aria-checked={theme === 'light'}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <Sun className="w-6 h-6" aria-hidden="true" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  role="radio"
                  aria-checked={theme === 'dark'}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <Moon className="w-6 h-6" aria-hidden="true" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  role="radio"
                  aria-checked={theme === 'system'}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    theme === 'system'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <Monitor className="w-6 h-6" aria-hidden="true" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Goal */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Daily Review Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dailyGoalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleDailyGoalChange(goal)}
                    className={cn(
                      'py-3 px-4 rounded-xl border-2 transition-all font-medium',
                      localDailyGoal === goal
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Complete {localDailyGoal} reviews daily to maintain your streak
              </p>
            </div>

            {/* Session Length */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Cards Per Session
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 20, 30, 50].map((length) => (
                  <button
                    key={length}
                    onClick={() => handleSessionLengthChange(length)}
                    className={cn(
                      'py-3 px-2 rounded-xl border-2 transition-all font-medium text-sm',
                      localSessionLength === length
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {length}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Number of cards shown in each study session
              </p>
            </div>

            {/* SRS Scheduling Mode */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Review Scheduling
              </label>
              <div className="space-y-2">
                {(Object.entries(SRS_PRESETS) as [SRSMode, typeof SRS_PRESETS[SRSMode]][]).map(([mode, preset]) => (
                  <button
                    key={mode}
                    onClick={() => setSrsMode(mode)}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl border-2 transition-all text-left',
                      srsMode === mode
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('font-medium', srsMode === mode && 'text-primary')}>
                        {preset.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {preset.intervalModifier < 1 ? 'More reviews' : preset.intervalModifier > 1 ? 'Fewer reviews' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Audio Pronunciation</p>
                  <p className="text-sm text-muted-foreground">
                    Play Greek word pronunciation
                  </p>
                </div>
              </div>
              <button
                onClick={handleAudioToggle}
                role="switch"
                aria-checked={audioEnabled}
                aria-label="Toggle audio pronunciation"
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors',
                  audioEnabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm',
                    audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5" />
              Vocabulary Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tier Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Vocabulary Tiers
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => {
                      if (selectedTiers.includes(tier)) {
                        setSelectedTiers(selectedTiers.filter(t => t !== tier));
                      } else {
                        setSelectedTiers([...selectedTiers, tier]);
                      }
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm',
                      selectedTiers.includes(tier)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    Tier {tier}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select which frequency tiers to include in study sessions
              </p>
            </div>

            {/* Part of Speech */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Parts of Speech
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PART_OF_SPEECH_INFO) as [PartOfSpeech, typeof PART_OF_SPEECH_INFO[PartOfSpeech]][]).map(([pos, info]) => (
                  <button
                    key={pos}
                    onClick={() => {
                      if (selectedPOS.includes(pos)) {
                        setSelectedPOS(selectedPOS.filter(p => p !== pos));
                      } else {
                        setSelectedPOS([...selectedPOS, pos]);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full border transition-all text-xs font-medium',
                      selectedPOS.includes(pos)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedPOS.length === 0 ? 'All parts of speech included' : `Filtering by ${selectedPOS.length} type${selectedPOS.length > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Semantic Categories */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Word Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(SEMANTIC_CATEGORIES) as [SemanticCategory, typeof SEMANTIC_CATEGORIES[SemanticCategory]][]).map(([cat, info]) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (selectedCategories.includes(cat)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat));
                      } else {
                        setSelectedCategories([...selectedCategories, cat]);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full border transition-all text-xs font-medium',
                      selectedCategories.includes(cat)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedCategories.length === 0 ? 'All categories included' : `Filtering by ${selectedCategories.length} categor${selectedCategories.length > 1 ? 'ies' : 'y'}`}
              </p>
            </div>

            {/* Clear Filters */}
            {(selectedPOS.length > 0 || selectedCategories.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPOS([]);
                  setSelectedCategories([]);
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {user ? <Users className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {user.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      user.role === 'teacher'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    )}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Teacher dashboard link */}
                {user.role === 'teacher' && (
                  <Link href="/teacher">
                    <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
                      <GraduationCap className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Teacher Dashboard</p>
                        <p className="text-sm text-muted-foreground">
                          View and manage your students
                        </p>
                      </div>
                    </button>
                  </Link>
                )}

                {/* Student teacher linking */}
                {user.role === 'student' && (
                  <div className="space-y-3">
                    {user.teacherId ? (
                      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950">
                        <div className="flex items-center gap-2 mb-2">
                          <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Linked to a teacher
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Your teacher can view your learning progress
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUnlinkFromTeacher}
                          className="w-full"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Unlink from Teacher
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label htmlFor="teacher-id-input" className="text-sm font-medium text-muted-foreground block">
                          Link to a Teacher
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Enter your teacher&apos;s ID to share your progress with them
                        </p>
                        <div className="flex gap-2">
                          <input
                            id="teacher-id-input"
                            type="text"
                            value={teacherIdInput}
                            onChange={(e) => setTeacherIdInput(e.target.value)}
                            placeholder="Enter teacher ID"
                            className={cn(
                              'flex-1 px-3 py-2 rounded-lg border bg-background text-sm',
                              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                            )}
                          />
                          <Button
                            onClick={handleLinkToTeacher}
                            disabled={isLinking || !teacherIdInput.trim()}
                            size="sm"
                          >
                            {isLinking ? 'Linking...' : 'Link'}
                          </Button>
                        </div>
                        {linkError && (
                          <p className="text-xs text-red-500">{linkError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={authLoading}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : isFirebaseAvailable() ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Sign in to sync your progress across devices and connect with teachers
                </p>
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Cloud sync is not configured. Your progress is saved locally on this device.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export */}
            <button
              onClick={handleExportData}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left',
                exportSuccess
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              {exportSuccess ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Download className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {exportSuccess ? 'Exported!' : 'Export Progress'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {exportSuccess ? 'Data saved to your downloads' : 'Download your learning data as JSON'}
                </p>
              </div>
            </button>

            {/* Import */}
            <label
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left cursor-pointer',
                importStatus === 'success'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : importStatus === 'error'
                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              {importStatus === 'success' ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : importStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {importStatus === 'success'
                    ? 'Import Successful!'
                    : importStatus === 'error'
                    ? 'Import Failed'
                    : 'Import Progress'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {importStatus === 'success'
                    ? 'Reloading to apply changes...'
                    : importStatus === 'error'
                    ? importError || 'Failed to import data'
                    : 'Restore from a backup JSON file'}
                </p>
              </div>
            </label>

            {/* Reset */}
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-left"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">Reset All Progress</p>
                  <p className="text-sm text-muted-foreground">
                    This will delete all your learning data
                  </p>
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950">
                <p className="font-medium text-red-600 dark:text-red-400 mb-2">
                  Are you sure?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all your progress, including XP, achievements, and word history. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetProgress}
                    className="flex-1"
                  >
                    Delete All Data
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-primary">{stats.xp.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-purple-500">Lv. {stats.level}</p>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-orange-500">{stats.longestStreak}</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-emerald-500">{stats.wordsLearned}</p>
                <p className="text-sm text-muted-foreground">Words Learned</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">
                  {stats.totalReviews > 0
                    ? Math.round((stats.correctReviews / stats.totalReviews) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-lg font-bold text-primary mb-1">Koine Greek Vocab</p>
            <p className="text-sm text-muted-foreground">Version 0.1.0</p>
            <p className="text-xs text-muted-foreground mt-2">
              Master New Testament Greek with spaced repetition
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 w-32 bg-muted rounded" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </main>
    </div>
  );
}
