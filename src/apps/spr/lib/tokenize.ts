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

    // Split hyphenated words into separate tokens for better pacing
    // e.g., "instruction-by-instruction" -> ["instruction-", "by-", "instruction"]
    if (rawToken.includes('-')) {
      const parts = rawToken.split('-');
      // Preserve trailing punctuation on the last segment only
      const lastPart = parts[parts.length - 1];
      const hasTrailingPunctuation = /[.!?,;:]$/.test(lastPart);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue; // Skip empty parts

        const isLast = i === parts.length - 1;
        // Keep hyphen on all segments except the last for visual clarity
        const tokenText = isLast ? part : `${part}-`;

        tokens.push({
          text: tokenText,
          isSentenceEnd:
            hasTrailingPunctuation &&
            isLast &&
            SENTENCE_PUNCTUATION.test(tokenText),
          isClauseEnd:
            hasTrailingPunctuation &&
            isLast &&
            CLAUSE_PUNCTUATION.test(tokenText),
          paragraphBreakBefore: paragraphBreakNext && i === 0,
        });
      }
    } else {
      const tokenText = rawToken;
      tokens.push({
        text: tokenText,
        isSentenceEnd: SENTENCE_PUNCTUATION.test(tokenText),
        isClauseEnd: CLAUSE_PUNCTUATION.test(tokenText),
        paragraphBreakBefore: paragraphBreakNext,
      });
    }

    paragraphBreakNext = false;
  }

  return tokens;
}
