import { describe, expect, test } from "bun:test";
import {
  getResolution,
  getResolutionIndex,
  isMaxResolution,
  RESOLUTIONS,
  scoreForResolution,
  scoreForWrongGuesses,
} from "../game";

describe("getResolutionIndex", () => {
  test("starts at index 0 for 0 wrong guesses", () => {
    expect(getResolutionIndex(0)).toBe(0);
  });

  test("increases index with each wrong guess", () => {
    expect(getResolutionIndex(1)).toBe(1);
    expect(getResolutionIndex(2)).toBe(2);
    expect(getResolutionIndex(3)).toBe(3);
    expect(getResolutionIndex(4)).toBe(4);
  });

  test("caps at max index after exceeding resolutions length", () => {
    expect(getResolutionIndex(5)).toBe(4);
    expect(getResolutionIndex(99)).toBe(4);
  });
});

describe("getResolution", () => {
  test("returns 16 for 0 wrong guesses", () => {
    expect(getResolution(0)).toBe(16);
  });

  test("doubles each time", () => {
    expect(getResolution(1)).toBe(32);
    expect(getResolution(2)).toBe(64);
    expect(getResolution(3)).toBe(128);
    expect(getResolution(4)).toBe(256);
  });

  test("stays at 256 after max", () => {
    expect(getResolution(5)).toBe(256);
  });
});

describe("scoreForResolution", () => {
  test("returns 5 for 16x16", () => {
    expect(scoreForResolution(16)).toBe(5);
  });

  test("returns decreasing points for higher resolutions", () => {
    expect(scoreForResolution(32)).toBe(4);
    expect(scoreForResolution(64)).toBe(3);
    expect(scoreForResolution(128)).toBe(2);
    expect(scoreForResolution(256)).toBe(1);
  });
});

describe("scoreForWrongGuesses", () => {
  test("returns 5 for 0 wrong guesses (16x16)", () => {
    expect(scoreForWrongGuesses(0)).toBe(5);
  });

  test("returns 4 for 1 wrong guess (32x32)", () => {
    expect(scoreForWrongGuesses(1)).toBe(4);
  });

  test("returns 3 for 2 wrong guesses (64x64)", () => {
    expect(scoreForWrongGuesses(2)).toBe(3);
  });

  test("returns 2 for 3 wrong guesses (128x128)", () => {
    expect(scoreForWrongGuesses(3)).toBe(2);
  });

  test("returns 1 for 4 wrong guesses (256x256)", () => {
    expect(scoreForWrongGuesses(4)).toBe(1);
  });

  test("returns 1 for more than 4 wrong guesses", () => {
    expect(scoreForWrongGuesses(5)).toBe(1);
  });
});

describe("isMaxResolution", () => {
  test("returns false for early wrong guesses", () => {
    expect(isMaxResolution(0)).toBe(false);
    expect(isMaxResolution(1)).toBe(false);
    expect(isMaxResolution(2)).toBe(false);
    expect(isMaxResolution(3)).toBe(false);
  });

  test("returns true at max resolution", () => {
    expect(isMaxResolution(4)).toBe(true);
  });

  test("returns true beyond max resolution", () => {
    expect(isMaxResolution(5)).toBe(true);
  });
});

describe("RESOLUTIONS", () => {
  test("has the correct sequence", () => {
    expect(RESOLUTIONS).toEqual([16, 32, 64, 128, 256]);
  });
});
