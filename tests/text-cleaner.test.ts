import { describe, it, expect } from "vitest";
import { cleanText } from "../src/lib/text-cleaner";

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
