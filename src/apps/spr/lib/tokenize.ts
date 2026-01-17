import type { SprToken } from '../types';

const PARAGRAPH_MARKER = '__SPR_PARAGRAPH_BREAK__';

const SENTENCE_PUNCTUATION = /[.!?]$/;
const CLAUSE_PUNCTUATION = /[;:]$/;

export function tokenizeText(text: string): SprToken[] {
  if (!text.trim()) {
    return [];
  }

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const withMarkers = normalized.replace(/\n\s*\n+/g, ` ${PARAGRAPH_MARKER} `);
  const rawTokens = withMarkers.split(/\s+/).filter(Boolean);

  const tokens: SprToken[] = [];
  let paragraphBreakNext = false;

  for (const rawToken of rawTokens) {
    if (rawToken === PARAGRAPH_MARKER) {
      paragraphBreakNext = true;
      continue;
    }

    const tokenText = rawToken;
    tokens.push({
      text: tokenText,
      isSentenceEnd: SENTENCE_PUNCTUATION.test(tokenText),
      isClauseEnd: CLAUSE_PUNCTUATION.test(tokenText),
      paragraphBreakBefore: paragraphBreakNext,
    });
    paragraphBreakNext = false;
  }

  return tokens;
}
