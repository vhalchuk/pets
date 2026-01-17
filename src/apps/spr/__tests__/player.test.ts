/// <reference types="vitest" />

import { renderHook, act } from '@testing-library/react';
import { useSprPlayer } from '../hooks/useSprPlayer';
import type { SprSettings, SprToken } from '../types';

const baseSettings: SprSettings = {
  wpm: 600,
  minWpm: 50,
  maxWpm: 2000,
  wpmStep: 10,
  skipSize: 5,
  orpEnabled: true,
  orpMode: 'medium',
  pauseOnPunctuation: true,
  sentencePauseMultiplier: 2,
  clausePauseMultiplier: 1.5,
  pauseOnParagraph: true,
  paragraphPauseMultiplier: 2,
  warmupEnabled: false,
  showGhostPreview: true,
  showProgressBar: true,
  layoutMode: 'compact',
  fontSize: 42,
  fontFamily: 'sans',
  lineHeight: 1.1,
  themePreset: 'app',
};

const tokens: SprToken[] = [
  {
    text: 'One',
    isSentenceEnd: false,
    isClauseEnd: false,
    paragraphBreakBefore: false,
  },
  {
    text: 'two.',
    isSentenceEnd: true,
    isClauseEnd: false,
    paragraphBreakBefore: false,
  },
  {
    text: 'three',
    isSentenceEnd: false,
    isClauseEnd: false,
    paragraphBreakBefore: false,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return window.setTimeout(
      () => cb(performance.now()),
      16
    ) as unknown as number;
  };
  global.cancelAnimationFrame = (id: number) => {
    window.clearTimeout(id as unknown as number);
  };
  window.requestAnimationFrame = global.requestAnimationFrame;
  window.cancelAnimationFrame = global.cancelAnimationFrame;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSprPlayer', () => {
  it('seeks and skips correctly', () => {
    const { result } = renderHook(() =>
      useSprPlayer({ tokens, settings: baseSettings })
    );

    act(() => result.current.actions.seek(2));
    expect(result.current.state.index).toBe(2);

    act(() => result.current.actions.skipBy(-1));
    expect(result.current.state.index).toBe(1);

    act(() => result.current.actions.skipBy(10));
    expect(result.current.state.index).toBe(2);
  });

  it('transitions to countdown when warmup is enabled', () => {
    const { result } = renderHook(() =>
      useSprPlayer({
        tokens,
        settings: { ...baseSettings, warmupEnabled: true },
      })
    );

    act(() => result.current.actions.play());
    expect(result.current.state.status).toBe('countdown');
  });

  it('advances words while playing', () => {
    const { result } = renderHook(() =>
      useSprPlayer({ tokens, settings: baseSettings })
    );

    act(() => result.current.actions.play());
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state.index).toBeGreaterThan(0);
  });
});
