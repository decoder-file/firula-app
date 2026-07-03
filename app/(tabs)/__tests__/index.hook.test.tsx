import {
  inferCategoryFromName,
  mapEventToHomeItem,
} from "@/features/home";

describe("home hook helpers", () => {
  it("infere categoria por nome", () => {
    expect(inferCategoryFromName("Campeonato de Beach Tennis")).toBe("beach-tennis");
    expect(inferCategoryFromName("Retiro de Yoga")).toBe("yoga");
    expect(inferCategoryFromName("Corrida Noturna")).toBe("corrida");
  });

  it("mapeia PlatformEvent para HomeEvent", () => {
    const mapped = mapEventToHomeItem(
      {
        id: "evt-1",
        name: "Maratona SP",
        slug: "maratona-sp",
        startsAt: "2026-08-10T12:00:00.000Z",
        status: "PUBLISHED",
        isFeatured: true,
        isTrending: false,
        coverUrl: "https://example.com/cover.jpg",
        organization: {
          id: "org-1",
          tradeName: "Firula Org",
          slug: "firula-org",
        },
        location: {
          city: "Sao Paulo",
          state: "SP",
        },
      },
      true,
    );

    expect(mapped.id).toBe("maratona-sp");
    expect(mapped.type).toBe("Corrida");
    expect(mapped.category).toBe("corrida");
    expect(mapped.city).toBe("Sao Paulo, SP");
    expect(mapped.hot).toBe(true);
  });
});
