import { describe, expect, it } from "vitest";
import { inlineTokens } from "@/lib/inline-md";

describe("inlineTokens", () => {
  it("renders bold and code", () => {
    expect(inlineTokens("used **82 generations** via `pixellab`")).toEqual([
      { t: "text", v: "used " }, { t: "strong", v: "82 generations" }, { t: "text", v: " via " }, { t: "code", v: "pixellab" },
    ]);
  });
  it("flattens table rows and drops checkbox emoji", () => {
    expect(inlineTokens("| Step | ⬜ Pending |")).toEqual([{ t: "text", v: "Step · Pending" }]);
  });
  it("drops any pictographic status glyph, e.g. U+1F532 in a table cell", () => {
    expect(inlineTokens("| WindowsSpoolerAdapter | windows_spooler | \u{1F532} Placeholder |")).toEqual([{ t: "text", v: "WindowsSpoolerAdapter · windows_spooler · Placeholder" }]);
  });
  it("leaves plain text alone", () => expect(inlineTokens("plain")).toEqual([{ t: "text", v: "plain" }]));
});
