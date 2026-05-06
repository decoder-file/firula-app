import { selectIsAuthenticated, useAuthStore } from "@/stores/authStore";

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
});