import { isVersionBelow } from "@/utils/version";

describe("isVersionBelow", () => {
  it("returns false for equal versions", () => {
    expect(isVersionBelow("1.2.3", "1.2.3")).toBe(false);
  });

  it("returns false when current is above minimum", () => {
    expect(isVersionBelow("1.3.0", "1.2.3")).toBe(false);
  });

  it("returns true when current is below minimum", () => {
    expect(isVersionBelow("1.2.0", "1.3.0")).toBe(true);
  });

  it("returns false (fail-open) when current is malformed", () => {
    expect(isVersionBelow("abc", "1.0.0")).toBe(false);
  });

  it("returns false (fail-open) when minimum is malformed", () => {
    expect(isVersionBelow("1.0.0", "not-a-version")).toBe(false);
  });

  it("returns false (fail-open) when both are malformed", () => {
    expect(isVersionBelow("abc", "def")).toBe(false);
  });

  it("treats a partial version as equal when padded segments match", () => {
    expect(isVersionBelow("1.2", "1.2.0")).toBe(false);
  });

  it("treats a missing minor/patch as below a fuller version", () => {
    expect(isVersionBelow("1", "1.0.1")).toBe(true);
  });

  it("returns false (fail-open) for an empty string on either side", () => {
    expect(isVersionBelow("", "1.0.0")).toBe(false);
    expect(isVersionBelow("1.0.0", "")).toBe(false);
  });
});
