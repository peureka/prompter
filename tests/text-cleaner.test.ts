import { describe, it, expect } from "vitest";
import { cleanText, firstLetters } from "../src/lib/text-cleaner";

describe("cleanText", () => {
  it("converts smart quotes to straight quotes", () => {
    expect(cleanText("\u201CHello\u201D")).toBe('"Hello"');
    expect(cleanText("\u2018world\u2019")).toBe("'world'");
  });

  it("collapses multiple spaces", () => {
    expect(cleanText("hello    world")).toBe("hello world");
  });

  it("collapses excessive newlines", () => {
    expect(cleanText("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("fixes double periods", () => {
    expect(cleanText("end.. next")).toBe("end. next");
  });

  it("adds space after punctuation when missing", () => {
    expect(cleanText("hello.world")).toBe("hello. world");
    expect(cleanText("a,b")).toBe("a, b");
  });

  it("does not break numbers like 3.14", () => {
    expect(cleanText("pi is 3.14")).toBe("pi is 3.14");
  });

  it("preserves //pause markers", () => {
    expect(cleanText("line one\n\n//pause\n\nline two")).toBe(
      "line one\n\n//pause\n\nline two"
    );
  });

  it("removes zero-width characters", () => {
    expect(cleanText("hel\u200Blo")).toBe("hello");
  });

  it("trims lines and overall text", () => {
    expect(cleanText("  hello  \n  world  ")).toBe("hello\nworld");
  });
});

describe("firstLetters", () => {
  it("reduces each word to its first character", () => {
    expect(firstLetters("To be or not to be")).toBe("T b o n t b");
  });

  it("preserves trailing punctuation attached to the letter", () => {
    expect(firstLetters("To be, or not to be.")).toBe("T b, o n t b.");
  });

  it("preserves leading punctuation like quotes and parens", () => {
    expect(firstLetters('"Hello" (world)')).toBe('"H" (w)');
  });

  it("preserves paragraph breaks", () => {
    expect(firstLetters("Hello world\n\nGoodbye now")).toBe("H w\n\nG n");
  });

  it("preserves single newlines", () => {
    expect(firstLetters("line one\nline two")).toBe("l o\nl t");
  });

  it("preserves //pause markers verbatim", () => {
    expect(firstLetters("hello world\n\n//pause\n\nmore text")).toBe(
      "h w\n\n//pause\n\nm t"
    );
  });

  it("keeps original case", () => {
    expect(firstLetters("HELLO world")).toBe("H w");
  });

  it("returns empty string for empty input", () => {
    expect(firstLetters("")).toBe("");
  });

  it("treats words connected by hyphens as a single word", () => {
    expect(firstLetters("well-known fact")).toBe("w f");
  });
});
