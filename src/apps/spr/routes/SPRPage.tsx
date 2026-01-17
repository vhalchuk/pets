import { Link } from '@tanstack/react-router';
import TextareaAutosize from 'react-textarea-autosize';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { tokenizeText } from '../lib/tokenize';
import {
  DEFAULT_SETTINGS,
  loadHistory,
  loadSession,
  loadSettings,
  makeTextId,
  saveHistory,
  saveSession,
  saveSettings,
  upsertHistoryItem,
} from '../lib/storage';
import { useSprPlayer } from '../hooks/useSprPlayer';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import type { SprHistoryItem, SprSettings } from '../types';
import { ReaderStage } from '../components/ReaderStage';
import { Controls } from '../components/Controls';
import { SettingsPanel } from '../components/SettingsPanel';
import { HistoryPanel } from '../components/HistoryPanel';

function deriveTitle(text: string) {
  const firstLine = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ? firstLine.slice(0, 80) : 'Untitled';
}

function formatReadingTime(words: number, wpm: number) {
  if (!words || !wpm) return '0s';
  const totalSeconds = Math.max(1, Math.ceil((words / wpm) * 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function isFormTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

export function SPRPage() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initialData = useMemo(() => {
    const initialHistory = loadHistory();
    const initialSession = loadSession();
    const activeId =
      initialSession.activeId &&
      initialHistory.some((item) => item.id === initialSession.activeId)
        ? initialSession.activeId
        : null;
    const activeItem = initialHistory.find((item) => item.id === activeId);
    const initialText = activeItem?.text ?? '';
    const initialTitle = activeItem?.title ?? deriveTitle(initialText);
    return {
      initialHistory,
      initialSession,
      activeId,
      initialText,
      initialTitle,
    };
  }, []);

  const [settings, setSettings] = useState<SprSettings>(() => loadSettings());
  const [history, setHistory] = useState<SprHistoryItem[]>(
    initialData.initialHistory
  );
  const [session, setSession] = useState(initialData.initialSession);
  const [activeId, setActiveId] = useState<string | null>(initialData.activeId);
  const [text, setText] = useState(initialData.initialText);
  const [title, setTitle] = useState(initialData.initialTitle);
  const [titleEdited, setTitleEdited] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const tokens = useMemo(() => tokenizeText(text), [text]);
  const wordCount = tokens.length;

  const activeHistoryItem = useMemo(
    () => history.find((item) => item.id === activeId) ?? null,
    [history, activeId]
  );

  const initialIndex = useMemo(() => {
    if (activeId && session.activeId === activeId) {
      return session.activeIndex;
    }
    return activeHistoryItem?.lastIndex ?? 0;
  }, [
    activeHistoryItem?.lastIndex,
    activeId,
    session.activeId,
    session.activeIndex,
  ]);

  const { state, actions } = useSprPlayer({
    tokens,
    settings,
    initialIndex,
    onIndexChange: (index) => {
      if (!activeId) return;
      setHistory((prev) => {
        const item = prev.find((entry) => entry.id === activeId);
        if (!item) return prev;
        const updated: SprHistoryItem = {
          ...item,
          lastIndex: index,
          updatedAt: Date.now(),
        };
        const next = upsertHistoryItem(prev, updated);
        saveHistory(next);
        return next;
      });
    },
  });

  const saveIndexTimeout = useRef<number | null>(null);
  useEffect(() => {
    if (saveIndexTimeout.current) {
      window.clearTimeout(saveIndexTimeout.current);
    }
    saveIndexTimeout.current = window.setTimeout(() => {
      const nextSession = {
        activeId,
        activeIndex: state.index,
      };
      setSession(nextSession);
      saveSession(nextSession);
    }, 250);

    return () => {
      if (saveIndexTimeout.current) {
        window.clearTimeout(saveIndexTimeout.current);
      }
    };
  }, [activeId, state.index]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!titleEdited) {
      setTitle(deriveTitle(text));
    }
    if (activeId && activeHistoryItem?.text !== text) {
      setActiveId(null);
    }
    actions.setStatus('paused');
  }, [actions, activeHistoryItem?.text, activeId, text, titleEdited]);

  const canPlay = wordCount > 0;
  const currentToken = tokens[state.index]?.text ?? null;
  const prevToken = tokens[state.index - 1]?.text ?? null;
  const nextToken = tokens[state.index + 1]?.text ?? null;

  const handlePlay = useCallback(() => {
    if (!text.trim()) {
      setNotice('Add some text before starting playback.');
      return;
    }

    if (notice) setNotice(null);

    const now = Date.now();
    const baseTitle = title.trim() || deriveTitle(text);
    const wordCountValue = tokens.length;

    let item = activeHistoryItem;
    if (!item || item.text !== text) {
      const newId = makeTextId(text);
      item = {
        id: newId,
        title: baseTitle,
        text,
        createdAt: now,
        updatedAt: now,
        wordCount: wordCountValue,
        lastIndex: state.index,
      };
      setActiveId(newId);
    } else {
      item = {
        ...item,
        title: baseTitle,
        updatedAt: now,
        wordCount: wordCountValue,
        lastIndex: state.index,
      };
    }

    setHistory((prev) => {
      const next = upsertHistoryItem(prev, item);
      saveHistory(next);
      return next;
    });

    actions.play();
  }, [
    activeHistoryItem,
    actions,
    notice,
    state.index,
    text,
    title,
    tokens.length,
  ]);

  const handlePause = useCallback(() => {
    actions.pause();
  }, [actions]);

  const handleSelectHistory = (id: string) => {
    const item = history.find((entry) => entry.id === id);
    if (!item) return;
    setActiveId(item.id);
    setText(item.text);
    setTitle(item.title);
    setTitleEdited(true);
    actions.seek(item.lastIndex);
  };

  const handleClearHistory = () => {
    if (!window.confirm('Clear all saved texts?')) return;
    setHistory([]);
    setActiveId(null);
    saveHistory([]);
  };

  const handleResetSettings = () => {
    if (!window.confirm('Reset SPR settings to defaults?')) return;
    setSettings(DEFAULT_SETTINGS);
  };

  const handleSettingsChange = useCallback((updates: Partial<SprSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      wpm: (() => {
        const nextWpm = updates.wpm ?? prev.wpm;
        const safeWpm = Number.isFinite(nextWpm) ? nextWpm : prev.wpm;
        return Math.min(prev.maxWpm, Math.max(prev.minWpm, safeWpm));
      })(),
    }));
  }, []);

  const handleWpmChange = useCallback(
    (value: number) => handleSettingsChange({ wpm: value }),
    [handleSettingsChange]
  );

  const handleSeek = useCallback(
    (index: number) => actions.seek(index),
    [actions]
  );

  const handleSkipBack = useCallback(
    () => actions.skipBy(-settings.skipSize),
    [actions, settings.skipSize]
  );

  const handleSkipForward = useCallback(
    () => actions.skipBy(settings.skipSize),
    [actions, settings.skipSize]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormTarget(event.target)) return;

      if (event.key === ' ') {
        event.preventDefault();
        if (state.status === 'playing' || state.status === 'countdown') {
          handlePause();
        } else {
          handlePlay();
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.skipBy(-settings.skipSize);
        } else {
          actions.previous();
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.skipBy(settings.skipSize);
        } else {
          actions.next();
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleSettingsChange({ wpm: settings.wpm + settings.wpmStep });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleSettingsChange({ wpm: settings.wpm - settings.wpmStep });
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        actions.restart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    actions,
    handlePause,
    handlePlay,
    handleSettingsChange,
    settings.skipSize,
    settings.wpm,
    settings.wpmStep,
    state.status,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <header className="space-y-2">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-4xl font-bold text-foreground">
            SPR: Speed Reading Presenter
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Paste text, customize pacing, and focus on one word at a time.
          </p>
        </header>

        {notice && (
          <div
            role="status"
            className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground"
          >
            {notice}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reader Stage</CardTitle>
            <CardDescription>
              {wordCount} words · Estimated time{' '}
              {formatReadingTime(wordCount, settings.wpm)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReaderStage
              token={currentToken}
              prevToken={prevToken}
              nextToken={nextToken}
              showGhostPreview={settings.showGhostPreview}
              orpEnabled={settings.orpEnabled}
              orpMode={settings.orpMode}
              fontSize={settings.fontSize}
              fontFamily={settings.fontFamily}
              lineHeight={settings.lineHeight}
              themePreset={settings.themePreset}
              layoutMode={settings.layoutMode}
              countdown={state.status === 'countdown' ? state.countdown : 0}
              reducedMotion={prefersReducedMotion}
            />
            <Controls
              status={state.status}
              canPlay={canPlay}
              skipSize={settings.skipSize}
              wpm={settings.wpm}
              minWpm={settings.minWpm}
              maxWpm={settings.maxWpm}
              step={settings.wpmStep}
              progress={state.index + 1}
              total={wordCount}
              showProgressBar={settings.showProgressBar}
              onPlay={handlePlay}
              onPause={handlePause}
              onRestart={actions.restart}
              onPrevious={actions.previous}
              onNext={actions.next}
              onSkipBack={handleSkipBack}
              onSkipForward={handleSkipForward}
              onWpmChange={handleWpmChange}
              onSeek={handleSeek}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Input</CardTitle>
                <CardDescription>
                  Paste or edit your text. Line breaks are treated as spaces.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="spr-title"
                    className="block text-sm font-medium text-foreground"
                  >
                    Title
                  </label>
                  <input
                    id="spr-title"
                    type="text"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setTitleEdited(true);
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Title for this text"
                  />
                </div>
                <div>
                  <label
                    htmlFor="spr-text"
                    className="block text-sm font-medium text-foreground"
                  >
                    Text
                  </label>
                  <TextareaAutosize
                    id="spr-text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    minRows={8}
                    maxRows={20}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Paste your reading text here..."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Word count: {wordCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Texts</CardTitle>
                <CardDescription>
                  Continue from where you left off.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryPanel
                  history={history}
                  activeId={activeId}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Customize the reading experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsPanel
                settings={settings}
                onChange={handleSettingsChange}
                onReset={handleResetSettings}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
