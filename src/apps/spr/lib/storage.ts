import type { SprHistoryItem, SprSessionState, SprSettings } from '../types';

const SETTINGS_KEY = 'spr:settings';
const HISTORY_KEY = 'spr:history';
const SESSION_KEY = 'spr:session';
const MAX_HISTORY = 10;

export const DEFAULT_SETTINGS: SprSettings = {
  wpm: 300,
  minWpm: 50,
  maxWpm: 1200,
  wpmStep: 10,
  skipSize: 10,
  orpEnabled: true,
  orpMode: 'medium',
  pauseOnPunctuation: true,
  sentencePauseMultiplier: 2.4,
  clausePauseMultiplier: 1.6,
  pauseOnParagraph: true,
  paragraphPauseMultiplier: 2.5,
  warmupEnabled: true,
  showGhostPreview: true,
  showProgressBar: true,
  layoutMode: 'compact',
  fontSize: 48,
  fontFamily: 'sans',
  lineHeight: 1.1,
  themePreset: 'app',
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadSettings(): SprSettings {
  const stored = safeParse<Partial<SprSettings>>(
    localStorage.getItem(SETTINGS_KEY),
    {}
  );
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  const maxWpm = Math.min(merged.maxWpm, DEFAULT_SETTINGS.maxWpm);
  const minWpm = Math.max(merged.minWpm, DEFAULT_SETTINGS.minWpm);
  return {
    ...merged,
    minWpm,
    maxWpm,
    wpm: Math.min(maxWpm, Math.max(minWpm, merged.wpm)),
  };
}

export function saveSettings(settings: SprSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): SprHistoryItem[] {
  const history = safeParse<SprHistoryItem[]>(
    localStorage.getItem(HISTORY_KEY),
    []
  );
  return Array.isArray(history) ? history : [];
}

export function saveHistory(history: SprHistoryItem[]) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, MAX_HISTORY))
  );
}

export function loadSession(): SprSessionState {
  const session = safeParse<SprSessionState>(
    localStorage.getItem(SESSION_KEY),
    { activeId: null, activeIndex: 0 }
  );
  return {
    activeId: session.activeId ?? null,
    activeIndex: session.activeIndex ?? 0,
  };
}

export function saveSession(session: SprSessionState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function makeTextId(text: string) {
  const normalized = text.trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  const hashPart = hash.toString(36);
  return `spr-${hashPart}-${Date.now().toString(36)}`;
}

export function upsertHistoryItem(
  history: SprHistoryItem[],
  item: SprHistoryItem
) {
  const existingIndex = history.findIndex((entry) => entry.id === item.id);
  let updated: SprHistoryItem[];

  if (existingIndex >= 0) {
    updated = history.map((entry) => (entry.id === item.id ? item : entry));
  } else {
    updated = [item, ...history];
  }

  return updated
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_HISTORY);
}
