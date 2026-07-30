import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";

import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";

jest.mock("react-native/Libraries/Linking/Linking", () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

describe("ForceUpdateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the default message when none is provided", () => {
    const { getByText } = render(
      <ForceUpdateScreen storeUrl="https://apps.apple.com/app/id123" message={null} />,
    );

    expect(
      getByText("Uma nova versão do Firula está disponível. Atualize o app para continuar usando."),
    ).toBeTruthy();
  });

  it("renders the custom message when provided", () => {
    const { getByText } = render(
      <ForceUpdateScreen storeUrl="https://apps.apple.com/app/id123" message="Mensagem customizada" />,
    );

    expect(getByText("Mensagem customizada")).toBeTruthy();
  });

  it("opens the store URL when the CTA is pressed and the URL can be opened", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(
      <ForceUpdateScreen storeUrl="https://apps.apple.com/app/id123" message={null} />,
    );

    fireEvent.press(getByText("Atualizar agora"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(Linking.canOpenURL).toHaveBeenCalledWith("https://apps.apple.com/app/id123");
    expect(Linking.openURL).toHaveBeenCalledWith("https://apps.apple.com/app/id123");
  });

  it("does not open the URL when it cannot be opened", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    const { getByText } = render(
      <ForceUpdateScreen storeUrl="https://apps.apple.com/app/id123" message={null} />,
    );

    fireEvent.press(getByText("Atualizar agora"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
