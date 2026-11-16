import { DEFAULT_POSTHOG_HOST, resolveAnalyticsConfig } from "@/analytics/config";
import { identityChange, toAnalyticsPerson } from "@/analytics/identity";
import { screenNameFromSegments } from "@/analytics/screens";

describe("resolveAnalyticsConfig", () => {
  it("sem chave: desligado", () => {
    expect(resolveAnalyticsConfig({}, false)).toEqual({ enabled: false, projectToken: "", host: DEFAULT_POSTHOG_HOST });
  });

  it("com chave em produção: ligado, host padrão ou o informado", () => {
    expect(resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: " phc_123 " }, false)).toEqual({
      enabled: true,
      projectToken: "phc_123",
      host: DEFAULT_POSTHOG_HOST,
    });
    expect(
      resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: "phc_123", EXPO_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com" }, false).host,
    ).toBe("https://eu.i.posthog.com");
  });

  it("chave pessoal (phx_) ou qualquer coisa que não seja token de projeto: desligado e descartada", () => {
    expect(resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: "phx_segredo" }, false)).toEqual({
      enabled: false,
      projectToken: "",
      host: DEFAULT_POSTHOG_HOST,
    });
    expect(resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: "qualquer" }, false).enabled).toBe(false);
  });

  it("em desenvolvimento: desligado, a não ser que peça explicitamente", () => {
    expect(resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: "phc_123" }, true).enabled).toBe(false);
    expect(
      resolveAnalyticsConfig({ EXPO_PUBLIC_POSTHOG_KEY: "phc_123", EXPO_PUBLIC_POSTHOG_ENABLE_IN_DEV: "true" }, true).enabled,
    ).toBe(true);
  });
});

describe("identidade", () => {
  const ana = { identityId: "id-ana", scope: "customer", adminProfiles: [], email: "ana@gmail.com", name: "Ana Souza" };

  it("só id, escopo e se é organizador — sem nome nem e-mail", () => {
    expect(toAnalyticsPerson(ana)).toEqual({ distinctId: "id-ana", properties: { scope: "customer", is_organizer: false } });
    expect(toAnalyticsPerson({ ...ana, adminProfiles: [{}] })?.properties.is_organizer).toBe(true);
    expect(JSON.stringify(toAnalyticsPerson(ana))).not.toMatch(/Ana Souza|ana@gmail/);
  });

  it("entrar identifica, sair zera, trocar de conta identifica a nova, nada muda = nada", () => {
    expect(identityChange(null, ana)).toMatchObject({ type: "identify", person: { distinctId: "id-ana" } });
    expect(identityChange(ana, null)).toEqual({ type: "reset" });
    expect(identityChange(ana, { ...ana, identityId: "id-bia" })).toMatchObject({ type: "identify", person: { distinctId: "id-bia" } });
    const anaRenamed = { ...ana, name: "Ana S." };
    expect(identityChange(ana, anaRenamed)).toBeNull();
    expect(identityChange(null, null)).toBeNull();
  });
});

describe("screenNameFromSegments", () => {
  it("agrupa pela rota, sem grupos nem index", () => {
    expect(screenNameFromSegments(["event", "[slug]"])).toBe("event/[slug]");
    expect(screenNameFromSegments(["(tabs)", "explore"])).toBe("explore");
    expect(screenNameFromSegments(["(tabs)", "index"])).toBe("home");
    expect(screenNameFromSegments([])).toBe("home");
    expect(screenNameFromSegments(["ticket", "[id]", "index"])).toBe("ticket/[id]");
  });
});
