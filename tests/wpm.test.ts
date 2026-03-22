import { describe, it, expect } from "vitest";
import { wpmToMsPerWord, wordCount, estimatedDurationSeconds, wpmToPixelsPerMs } from "../src/lib/wpm";

describe("wpmToMsPerWord", () => {
  it("converts 150 WPM to 400ms per word", () => {
    expect(wpmToMsPerWord(150)).toBe(400);
  });

  it("converts 60 WPM to 1000ms per word", () => {
    expect(wpmToMsPerWord(60)).toBe(1000);
  });
});

describe("wordCount", () => {
  it("counts words in a sentence", () => {
    expect(wordCount("hello world foo bar")).toBe(4);
  });

  it("handles extra whitespace", () => {
    expect(wordCount("  hello   world  ")).toBe(2);
  });

  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(wordCount("   ")).toBe(0);
  });
});

describe("estimatedDurationSeconds", () => {
  it("calculates duration for 150 words at 150 WPM = 60s", () => {
    const text = Array(150).fill("word").join(" ");
    expect(estimatedDurationSeconds(text, 150)).toBe(60);
  });
});

describe("wpmToPixelsPerMs", () => {
  it("returns positive value for valid inputs", () => {
    const result = wpmToPixelsPerMs(150, 40, 8);
    expect(result).toBeGreaterThan(0);
  });

  it("doubles when WPM doubles", () => {
    const slow = wpmToPixelsPerMs(100, 40, 8);
    const fast = wpmToPixelsPerMs(200, 40, 8);
    expect(fast).toBeCloseTo(slow * 2);
  });
});
