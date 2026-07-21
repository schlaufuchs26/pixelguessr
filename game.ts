export interface Round {
  image: string;
  name: string;
}

export const RESOLUTIONS = [16, 32, 64, 128, 256] as const;
export type Resolution = (typeof RESOLUTIONS)[number];

const SCORE_MAP: Record<Resolution, number> = {
  16: 5,
  32: 4,
  64: 3,
  128: 2,
  256: 1,
};

export const ROUNDS: Round[] = [
  { image: "images/cat.jpg", name: "Cat" },
  { image: "images/eiffel.jpg", name: "Eiffel Tower" },
  { image: "images/pizza.jpg", name: "Pizza" },
  { image: "images/guitar.jpg", name: "Guitar" },
  { image: "images/strawberry.jpg", name: "Strawberry" },
];

/** Get the current resolution index (0-based) from the round's wrong guess count. */
export function getResolutionIndex(wrongGuesses: number): number {
  return Math.min(wrongGuesses, RESOLUTIONS.length - 1);
}

/** Get the current resolution for a given number of wrong guesses. */
export function getResolution(wrongGuesses: number): Resolution {
  const idx = getResolutionIndex(wrongGuesses);
  return RESOLUTIONS[idx] ?? 256;
}

/** Calculate the score earned for guessing at a given resolution. */
export function scoreForResolution(resolution: Resolution): number {
  return SCORE_MAP[resolution];
}

/** Calculate score based on wrong guesses (how many wrong guesses before the correct one). */
export function scoreForWrongGuesses(wrongGuesses: number): number {
  const resolution = getResolution(wrongGuesses);
  return scoreForResolution(resolution);
}

/** Check if the game is over (resolution is at max). */
export function isMaxResolution(wrongGuesses: number): boolean {
  return getResolutionIndex(wrongGuesses) >= RESOLUTIONS.length - 1;
}
