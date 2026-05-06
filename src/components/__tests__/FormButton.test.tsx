import { fireEvent, render } from "@testing-library/react-native";

import { FormButton } from "@/components/ui/FormButton";

describe("FormButton", () => {
  it("renders the default label", () => {
    const { getByText } = render(
      <FormButton label="Entrar" onPress={jest.fn()} />,
    );

    expect(getByText("Entrar")).toBeTruthy();
  });

  it("renders the loading label when loading", () => {
    const { getByText } = render(
      <FormButton isLoading label="Criar conta" loadingLabel="Enviando..." onPress={jest.fn()} />,
    );

    expect(getByText("Enviando...")).toBeTruthy();
  });

  it("calls onPress when enabled", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FormButton label="Entrar" onPress={onPress} testID="form-button" />,
    );

    fireEvent.press(getByTestId("form-button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FormButton isLoading label="Entrar" onPress={onPress} testID="form-button" />,
    );

    fireEvent.press(getByTestId("form-button"));

    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId("form-button").props.className).toContain("opacity-60");
  });
});