import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { PlayerStatus, SprSettings, SprToken } from '../types';
import { useLatestRef } from '@/hooks/useLatestRef';

const requestFrame = (callback: FrameRequestCallback) => {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(callback);
  }
  return window.setTimeout(() => callback(performance.now()), 16);
};

const cancelFrame = (id: number) => {
  if (typeof globalThis.cancelAnimationFrame === 'function') {
    globalThis.cancelAnimationFrame(id);
    return;
  }
  window.clearTimeout(id);
};

interface PlayerState {
  status: PlayerStatus;
  index: number;
  countdown: number;
}

type PlayerAction =
  | { type: 'play'; countdownSeconds: number }
  | { type: 'pause' }
  | { type: 'setIndex'; index: number }
  | { type: 'setStatus'; status: PlayerStatus }
  | { type: 'setCountdown'; countdown: number }
  | { type: 'reset' };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'play':
      return {
        ...state,
        status: action.countdownSeconds > 0 ? 'countdown' : 'playing',
        countdown: action.countdownSeconds,
      };
    case 'pause':
      return { ...state, status: 'paused', countdown: 0 };
    case 'setIndex':
      return { ...state, index: action.index };
    case 'setStatus':
      return { ...state, status: action.status };
    case 'setCountdown':
      return { ...state, countdown: action.countdown };
    case 'reset':
      return { status: 'idle', index: 0, countdown: 0 };
    default:
      return state;
  }
}

function getDelayForIndex(
  index: number,
  tokens: SprToken[],
  settings: SprSettings
) {
  const token = tokens[index];
  if (!token) return 0;

  const wpm = Math.min(
    settings.maxWpm,
    Math.max(settings.minWpm, settings.wpm)
  );
  const baseMs = 60000 / Math.max(1, wpm);

  let multiplier = 1;
  if (settings.pauseOnPunctuation) {
    if (token.isSentenceEnd) {
      multiplier *= settings.sentencePauseMultiplier;
    } else if (token.isClauseEnd) {
      multiplier *= settings.clausePauseMultiplier;
    }
  }

  if (settings.pauseOnParagraph) {
    const nextToken = tokens[index + 1];
    if (nextToken?.paragraphBreakBefore) {
      multiplier *= settings.paragraphPauseMultiplier;
    }
  }

  return baseMs * multiplier;
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

function findPreviousSentenceStart(
  currentIndex: number,
  tokens: SprToken[]
): number {
  if (tokens.length === 0 || currentIndex <= 0) return 0;

  // Check if we're at a sentence start (token after a sentence end)
  // If so, we want to go back one more sentence
  let searchFrom = currentIndex - 1;
  if (currentIndex > 0 && tokens[currentIndex - 1]?.isSentenceEnd) {
    // We're already at a sentence start, so search from one token before
    searchFrom = currentIndex - 2;
  }

  // Find the last sentence end before the search position
  for (let i = searchFrom; i >= 0; i--) {
    if (tokens[i].isSentenceEnd) {
      // Move to the start of that sentence (token after the sentence end)
      const nextIndex = i + 1;
      return nextIndex < tokens.length ? nextIndex : i;
    }
  }

  // No sentence end found, go to beginning
  return 0;
}

function findNextSentenceStart(
  currentIndex: number,
  tokens: SprToken[]
): number {
  if (tokens.length === 0) return 0;
  if (currentIndex >= tokens.length - 1) return tokens.length - 1;

  // Find the next sentence end at or after current index
  for (let i = currentIndex; i < tokens.length; i++) {
    if (tokens[i].isSentenceEnd) {
      // Move to the start of the next sentence (token after the sentence end)
      const nextIndex = i + 1;
      return nextIndex < tokens.length ? nextIndex : tokens.length - 1;
    }
  }

  // No sentence end found, go to end
  return tokens.length - 1;
}

interface UseSprPlayerOptions {
  tokens: SprToken[];
  settings: SprSettings;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function useSprPlayer({
  tokens,
  settings,
  initialIndex = 0,
  onIndexChange,
}: UseSprPlayerOptions) {
  const [state, dispatch] = useReducer(playerReducer, {
    status: 'idle',
    index: initialIndex,
    countdown: 0,
  });

  const stateRef = useLatestRef(state);
  const tokensRef = useLatestRef(tokens);
  const settingsRef = useLatestRef(settings);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const carryRef = useRef(0);
  const countdownCarryRef = useRef(0);

  useEffect(() => {
    if (stateRef.current.index !== initialIndex) {
      dispatch({
        type: 'setIndex',
        index: clampIndex(initialIndex, tokens.length),
      });
    }
  }, [initialIndex, tokens.length, stateRef]);

  const onIndexChangeEvent = useEffectEvent((index: number) => {
    onIndexChange?.(index);
  });

  useEffect(() => {
    onIndexChangeEvent(state.index);
  }, [state.index]); // eslint-disable-line react-hooks/exhaustive-deps -- onIndexChangeEvent is created with useEffectEvent and is intentionally stable

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopRaf();
    carryRef.current = 0;
    countdownCarryRef.current = 0;

    if (state.status === 'playing' || state.status === 'countdown') {
      lastTickRef.current = performance.now();

      const tick = (now: number) => {
        const currentState = stateRef.current;
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;

        if (currentState.status === 'countdown') {
          countdownCarryRef.current += elapsed;
          if (countdownCarryRef.current >= 1000) {
            const ticks = Math.floor(countdownCarryRef.current / 1000);
            const nextCountdown = Math.max(0, currentState.countdown - ticks);
            countdownCarryRef.current = countdownCarryRef.current % 1000;
            dispatch({ type: 'setCountdown', countdown: nextCountdown });
            if (nextCountdown === 0) {
              dispatch({ type: 'setStatus', status: 'playing' });
            }
          }
        }

        const nextState = stateRef.current;
        if (nextState.status === 'playing') {
          const tokensList = tokensRef.current;
          if (tokensList.length === 0) {
            dispatch({ type: 'setStatus', status: 'idle' });
            stopRaf();
            return;
          }

          let remaining = carryRef.current + elapsed;
          let nextIndex = nextState.index;

          while (remaining > 0 && nextIndex < tokensList.length) {
            const delay = getDelayForIndex(
              nextIndex,
              tokensList,
              settingsRef.current
            );
            if (delay <= 0 || remaining < delay) {
              break;
            }
            remaining -= delay;
            nextIndex += 1;
            if (nextIndex >= tokensList.length) {
              nextIndex = tokensList.length - 1;
              dispatch({ type: 'setStatus', status: 'finished' });
              break;
            }
          }

          carryRef.current = remaining;
          if (nextIndex !== nextState.index) {
            dispatch({
              type: 'setIndex',
              index: clampIndex(nextIndex, tokensList.length),
            });
          }
        }

        if (
          stateRef.current.status === 'playing' ||
          stateRef.current.status === 'countdown'
        ) {
          rafRef.current = requestFrame(tick);
        }
      };

      rafRef.current = requestFrame(tick);
    }

    return stopRaf;
  }, [state.status, stopRaf]); // eslint-disable-line react-hooks/exhaustive-deps -- Refs (stateRef, tokensRef, settingsRef) are stable and intentionally not included

  const actions = useMemo(() => {
    return {
      play: () => {
        const tokensList = tokensRef.current;
        if (tokensList.length === 0) return;

        if (stateRef.current.status === 'finished') {
          dispatch({ type: 'setIndex', index: 0 });
        }

        const countdownSeconds = settingsRef.current.warmupEnabled ? 3 : 0;
        dispatch({ type: 'play', countdownSeconds });
      },
      pause: () => dispatch({ type: 'pause' }),
      restart: () => {
        dispatch({ type: 'setIndex', index: 0 });
        dispatch({ type: 'setStatus', status: 'paused' });
      },
      seek: (index: number) => {
        const tokensList = tokensRef.current;
        dispatch({
          type: 'setIndex',
          index: clampIndex(index, tokensList.length),
        });
      },
      skipBy: (delta: number) => {
        const tokensList = tokensRef.current;
        dispatch({
          type: 'setIndex',
          index: clampIndex(stateRef.current.index + delta, tokensList.length),
        });
      },
      skipToPreviousSentence: () => {
        const tokensList = tokensRef.current;
        const targetIndex = findPreviousSentenceStart(
          stateRef.current.index,
          tokensList
        );
        dispatch({
          type: 'setIndex',
          index: targetIndex,
        });
      },
      skipToNextSentence: () => {
        const tokensList = tokensRef.current;
        const targetIndex = findNextSentenceStart(
          stateRef.current.index,
          tokensList
        );
        dispatch({
          type: 'setIndex',
          index: targetIndex,
        });
      },
      next: () => {
        const tokensList = tokensRef.current;
        dispatch({
          type: 'setIndex',
          index: clampIndex(stateRef.current.index + 1, tokensList.length),
        });
      },
      previous: () => {
        const tokensList = tokensRef.current;
        dispatch({
          type: 'setIndex',
          index: clampIndex(stateRef.current.index - 1, tokensList.length),
        });
      },
      reset: () => dispatch({ type: 'reset' }),
      setStatus: (status: PlayerStatus) =>
        dispatch({ type: 'setStatus', status }),
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Refs (stateRef, tokensRef, settingsRef) are stable and intentionally not included

  return { state, actions };
}
