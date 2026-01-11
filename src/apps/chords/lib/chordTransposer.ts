/**
 * Chord transposition utility
 * Transposes chord roots by a specified number of semitones
 */

// Chromatic scale mapping
const CHROMATIC_SCALE = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

// Alternative enharmonic equivalents
const ENHARMONIC_MAP: Record<string, string[]> = {
  'C#': ['Db'],
  'D#': ['Eb'],
  'F#': ['Gb'],
  'G#': ['Ab'],
  'A#': ['Bb'],
  Db: ['C#'],
  Eb: ['D#'],
  Gb: ['F#'],
  Ab: ['G#'],
  Bb: ['A#'],
};

/**
 * Transposes a chord by the specified number of semitones
 * @param chord The chord to transpose (e.g., "C", "Am", "F#m7")
 * @param semitones Number of semitones to transpose (positive = up, negative = down)
 * @returns The transposed chord
 */
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;

  // Normalize semitones to be within -12 to +12 range
  const normalizedSemitones = ((semitones % 12) + 12) % 12;
  const direction = semitones >= 0 ? 1 : -1;
  const finalSemitones = direction * normalizedSemitones;

  // Extract root note and suffix
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const [, root, suffix] = match;

  // Find current root position in chromatic scale
  let currentIndex = CHROMATIC_SCALE.indexOf(root);

  // Handle enharmonic equivalents
  if (currentIndex === -1) {
    for (const [key, equivalents] of Object.entries(ENHARMONIC_MAP)) {
      if (equivalents.includes(root)) {
        currentIndex = CHROMATIC_SCALE.indexOf(key);
        break;
      }
    }
  }

  if (currentIndex === -1) return chord;

  // Calculate new root position
  let newIndex = currentIndex + finalSemitones;

  // Wrap around the chromatic scale
  if (newIndex < 0) {
    newIndex += 12;
  } else if (newIndex >= 12) {
    newIndex -= 12;
  }

  const newRoot = CHROMATIC_SCALE[newIndex];
  return newRoot + suffix;
}

/**
 * Transposes a line of lyrics with chords
 * @param line The line containing chords in square brackets
 * @param semitones Number of semitones to transpose
 * @returns The line with transposed chords
 */
export function transposeLine(line: string, semitones: number): string {
  if (!line || semitones === 0) return line;

  return line.replace(/\[([^\]]+)\]/g, (_, chord) => {
    const transposedChord = transposeChord(chord, semitones);
    return `[${transposedChord}]`;
  });
}
