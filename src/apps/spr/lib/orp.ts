import type { OrpMode } from '../types';

function getBaseOrpIndex(length: number): number {
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
}

function findCoreBounds(word: string) {
  const start = word.search(/[A-Za-z0-9]/);
  if (start === -1) {
    return { start: 0, end: Math.max(0, word.length - 1) };
  }
  let end = word.length - 1;
  for (; end >= 0; end -= 1) {
    if (/[A-Za-z0-9]/.test(word[end])) {
      break;
    }
  }
  return { start, end };
}

export function getOrpIndex(word: string, mode: OrpMode): number {
  if (!word) return 0;

  const { start, end } = findCoreBounds(word);
  const coreLength = Math.max(1, end - start + 1);
  const baseIndex = getBaseOrpIndex(coreLength);

  let adjusted = baseIndex;
  if (mode === 'short') {
    adjusted = Math.max(0, baseIndex - 1);
  } else if (mode === 'long') {
    adjusted = Math.min(coreLength - 1, baseIndex + 1);
  }

  return Math.min(word.length - 1, start + adjusted);
}
