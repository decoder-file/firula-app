import { formatOrganizerAddress } from "../organizerAddress";

describe("formatOrganizerAddress", () => {
  it.each([
    { city: "São Paulo", state: "SP" },
    { address: "   ", city: "São Paulo", state: "SP" },
    { address: "Rua das Flores", city: " ", state: "SP" },
  ])("does not build a map address from incomplete data: %j", (organization) => {
    expect(formatOrganizerAddress(organization)).toBeNull();
  });

  it("formats the registered address without inventing missing fields", () => {
    expect(formatOrganizerAddress({ address: " Rua das Flores ", city: "São Paulo", state: "" }))
      .toBe("Rua das Flores, São Paulo");
  });

  it("includes number, complement, neighborhood and postal code when provided", () => {
    expect(formatOrganizerAddress({
      address: "Rua das Flores", addressNumber: "10", addressComplement: "Bloco A",
      neighborhood: "Centro", city: "São Paulo", state: "SP", postalCode: "01000-000",
    })).toBe("Rua das Flores, 10, Bloco A, Centro, São Paulo - SP, 01000-000");
  });
});
