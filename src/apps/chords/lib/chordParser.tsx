import React from 'react';
import { transposeLine } from './chordTransposer';

/**
 * Parses lyrics with chord notation and returns JSX with styled chords
 * Chords are denoted by square brackets: [C], [Am], [F], etc.
 * Section titles are denoted by ## at the start of a line: ## Verse 1
 * @param lyrics The lyrics string with chord notation
 * @param transpositionSemitones Number of semitones to transpose chords (default: 0)
 */
export function parseLyricsWithChords(
  lyrics: string,
  transpositionSemitones: number = 0
): React.ReactNode[] {
  // Apply transposition to the lyrics line
  const transposedLyrics =
    transpositionSemitones !== 0
      ? transposeLine(lyrics, transpositionSemitones)
      : lyrics;

  // Check if this is a section title (starts with ##)
  if (transposedLyrics.startsWith('## ')) {
    const titleText = transposedLyrics.substring(3); // Remove "## "
    return [
      <h2 key="section-title" className="font-bold text-foreground mb-2">
        {titleText}
      </h2>,
    ];
  }

  // If line is empty, return empty paragraph
  if (transposedLyrics.trim() === '') {
    return [
      <p key="empty-line" className="mb-1">
        &nbsp;
      </p>,
    ];
  }

  // Regex to match chords in square brackets
  const chordRegex = /\[([^\]]+)\]/g;
  const parts = transposedLyrics.split(chordRegex);

  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Even indices are text parts
      if (parts[i]) {
        result.push(parts[i]);
      }
    } else {
      // Odd indices are chord parts
      result.push(
        <span
          key={`chord-${i}`}
          className="inline-block bg-primary/10 text-primary border border-primary/20"
          style={{
            fontSize: '0.75em',
            padding: '0.1em 0.5em',
            borderRadius: '0.625em',
          }}
        >
          {parts[i]}
        </span>
      );
    }
  }

  return [
    <p key="lyrics-line" className="mb-1">
      {result}
    </p>,
  ];
}

/**
 * Parses lyrics and returns plain text without chord notation
 * Removes all chord brackets: [C], [Am], [F], etc.
 * Preserves section titles: ## Verse 1
 * @param lyrics The lyrics string with chord notation
 * @returns Plain text lyrics without chords but with section titles
 */
export function parseLyricsWithoutChords(lyrics: string): string {
  // Check if this is a section title (starts with ##)
  if (lyrics.startsWith('## ')) {
    return lyrics; // Keep section titles as-is
  }

  // Remove all chord notation (square brackets and their contents)
  return lyrics.replace(/\[([^\]]+)\]/g, '');
}
