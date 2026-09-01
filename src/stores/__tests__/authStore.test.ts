import { selectIsAuthenticated, selectIsCustomerScoped, useAuthStore } from "@/stores/authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      customer: null,
      userProfile: null,
      isHydrated: true,
    });
  });

  it("marks the user as authenticated when a customer exists", () => {
    useAuthStore.getState().setUser(
      {
        id: "customer-1",
        email: "cliente@exemplo.com",
        name: "Joao Silva",
        emailVerified: true,
      },
      { id: "profile-1", cpf: "12345678900", phone: "11999999999" },
    );

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it("clears the persisted user state on logout", () => {
    useAuthStore.getState().setUser(
      {
        id: "customer-1",
        email: "cliente@exemplo.com",
        name: "Joao Silva",
        emailVerified: true,
      },
      null,
    );

    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().customer).toBeNull();
    expect(useAuthStore.getState().userProfile).toBeNull();
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });

  it("selectIsCustomerScoped is true only for a customer-scoped session, not admin", () => {
    useAuthStore.getState().setUser(
      {
        identityId: "identity-1",
        email: "cliente@exemplo.com",
        name: "Joao Silva",
        photoUrl: null,
        scope: "customer",
        adminProfiles: [],
      },
      { id: "profile-1", cpf: "12345678900", phone: "11999999999" },
    );
    expect(selectIsCustomerScoped(useAuthStore.getState())).toBe(true);

    useAuthStore.getState().setUser(
      {
        identityId: "identity-2",
        email: "professor@exemplo.com",
        name: "Professor",
        photoUrl: null,
        scope: "admin",
        adminProfiles: [],
      },
      null,
    );
    expect(selectIsCustomerScoped(useAuthStore.getState())).toBe(false);
  });

  it("selectIsCustomerScoped is false when there's no session at all", () => {
    expect(selectIsCustomerScoped(useAuthStore.getState())).toBe(false);
  });
});