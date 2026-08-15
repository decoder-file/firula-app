import { getEventAccentColors } from "@/utils/eventTheme";

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

describe("getEventAccentColors", () => {
  it("returns undefined when there is no custom color", () => {
    expect(getEventAccentColors(undefined)).toBeUndefined();
    expect(getEventAccentColors(null)).toBeUndefined();
    expect(getEventAccentColors("")).toBeUndefined();
  });

  it("returns undefined for malformed hex values", () => {
    expect(getEventAccentColors("not-a-color")).toBeUndefined();
    expect(getEventAccentColors("#fff")).toBeUndefined();
    expect(getEventAccentColors("#gggggg")).toBeUndefined();
  });

  it("is case-insensitive", () => {
    expect(getEventAccentColors("#e4212b")).toEqual(getEventAccentColors("#E4212B"));
  });

  it("derives a full accent palette, keeping primary close to the input color", () => {
    const input = "#E4212B";
    const result = getEventAccentColors(input);

    expect(result).toBeDefined();
    expect(result!.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result!.primaryText).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result!.primarySoft).toMatch(/^#[0-9a-f]{6}$/i);

    // conversão hex->hsl->hex arredonda, então o resultado pode diferir por ~1
    // unidade em cada canal — não precisa bater byte a byte com o hex original.
    const [r1, g1, b1] = hexToRgb(input);
    const [r2, g2, b2] = hexToRgb(result!.primary);
    expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(2);
    expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(2);
    expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(2);
  });

  it("picks a dark onPrimary for a light/pastel accent color", () => {
    const result = getEventAccentColors("#FDE68A");

    expect(result!.onPrimary).toBe("#0A2E1A");
  });

  it("picks a light onPrimary for a dark accent color", () => {
    const result = getEventAccentColors("#1A1A2E");

    expect(result!.onPrimary).toBe("#FFFFFF");
  });

  it("matches the app's default onPrimary when fed a similar green", () => {
    // sanity check: o verde padrão do backoffice (#16a34a) deve produzir o mesmo
    // onPrimary já usado como padrão em design-system/foundation/colors.ts.
    const result = getEventAccentColors("#16a34a");

    expect(result!.onPrimary).toBe("#0A2E1A");
  });

  it("keeps primaryText and primarySoft well-formed regardless of input lightness", () => {
    const fromDark = getEventAccentColors("#0D0D1A")!;
    const fromLight = getEventAccentColors("#FDF6E3")!;

    expect(fromDark.primaryText).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fromDark.primarySoft).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fromLight.primaryText).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fromLight.primarySoft).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
