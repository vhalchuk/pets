export type OrpMode = 'short' | 'medium' | 'long';

export type ThemePreset = 'app' | 'light' | 'dark' | 'sepia';

export type LayoutMode = 'compact' | 'focus';

export interface SprToken {
  text: string;
  isSentenceEnd: boolean;
  isClauseEnd: boolean;
  paragraphBreakBefore: boolean;
}

export interface SprSettings {
  wpm: number;
  minWpm: number;
  maxWpm: number;
  wpmStep: number;
  skipSize: number;
  orpEnabled: boolean;
  orpMode: OrpMode;
  contextEnabled: boolean;
  contextSentenceCount: number;
  pauseOnPunctuation: boolean;
  sentencePauseMultiplier: number;
  clausePauseMultiplier: number;
  pauseOnParagraph: boolean;
  paragraphPauseMultiplier: number;
  warmupEnabled: boolean;
  showProgressBar: boolean;
  layoutMode: LayoutMode;
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  lineHeight: number;
  themePreset: ThemePreset;
}

export interface SprHistoryItem {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  lastIndex: number;
}

export interface SprSessionState {
  activeId: string | null;
  activeIndex: number;
}

export type PlayerStatus =
  | 'idle'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'finished';
