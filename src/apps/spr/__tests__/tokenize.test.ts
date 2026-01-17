/// <reference types="vitest/globals" />

import { tokenizeText } from '../lib/tokenize';

describe('tokenizeText', () => {
  it('splits on whitespace and preserves punctuation', () => {
    const tokens = tokenizeText('Hello, world! This is SPR.');
    expect(tokens).toHaveLength(5);
    expect(tokens[0].text).toBe('Hello,');
    expect(tokens[1].text).toBe('world!');
    expect(tokens[1].isSentenceEnd).toBe(true);
    expect(tokens[4].text).toBe('SPR.');
  });

  it('treats line breaks as spaces', () => {
    const tokens = tokenizeText('Line one\nLine two\nLine three');
    expect(tokens.map((token) => token.text)).toEqual([
      'Line',
      'one',
      'Line',
      'two',
      'Line',
      'three',
    ]);
  });

  it('flags paragraph breaks after blank lines', () => {
    const tokens = tokenizeText('First paragraph.\n\nSecond paragraph starts.');
    expect(tokens).toHaveLength(5);
    expect(tokens[2].paragraphBreakBefore).toBe(true);
  });

  it('recognizes clause punctuation', () => {
    const tokens = tokenizeText('Wait; what: now');
    expect(tokens[0].isClauseEnd).toBe(true);
    expect(tokens[1].isClauseEnd).toBe(true);
  });

  it('splits hyphenated words into separate tokens, preserving hyphens', () => {
    const tokens = tokenizeText('instruction-by-instruction');
    expect(tokens.map((token) => token.text)).toEqual([
      'instruction-',
      'by-',
      'instruction',
    ]);
  });

  it('preserves trailing punctuation on hyphenated words', () => {
    const tokens = tokenizeText('state-of-the-art.');
    expect(tokens.map((token) => token.text)).toEqual([
      'state-',
      'of-',
      'the-',
      'art.',
    ]);
    expect(tokens[3].isSentenceEnd).toBe(true);
  });

  it('handles hyphenated words with clause punctuation', () => {
    const tokens = tokenizeText('word-by-word; step-by-step:');
    expect(tokens.map((token) => token.text)).toEqual([
      'word-',
      'by-',
      'word;',
      'step-',
      'by-',
      'step:',
    ]);
    expect(tokens[2].isClauseEnd).toBe(true);
    expect(tokens[5].isClauseEnd).toBe(true);
  });
});
