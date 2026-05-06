import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { FormInput } from "@/components/ui/FormInput";

describe("FormInput", () => {
  it("renders the label and the error message", () => {
    const { getByText, getByTestId } = render(
      <FormInput
        error="Campo obrigatório"
        errorTestID="form-input-error"
        label="Email"
        value=""
      />,
    );

    expect(getByText("Email")).toBeTruthy();
    expect(getByTestId("form-input-error").props.children).toBe("Campo obrigatório");
  });

  it("forwards change events to the underlying TextInput", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <FormInput
        inputTestID="form-input"
        label="Nome"
        onChangeText={onChangeText}
        value=""
      />,
    );

    fireEvent.changeText(getByTestId("form-input"), "João Silva");

    expect(onChangeText).toHaveBeenCalledWith("João Silva");
  });

  it("renders a pressable right adornment when provided", () => {
    const onRightAdornmentPress = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <FormInput
        inputTestID="password-input"
        label="Senha"
        onRightAdornmentPress={onRightAdornmentPress}
        rightAdornment={<Text>toggle</Text>}
        rightAdornmentAccessibilityLabel="Mostrar senha"
        value="segredo"
      />,
    );

    fireEvent.press(getByLabelText("Mostrar senha"));

    expect(onRightAdornmentPress).toHaveBeenCalledTimes(1);
    expect(getByTestId("password-input").props.className).toContain("pr-14");
  });

  it("applies the error border class when error is present", () => {
    const { getByTestId } = render(
      <FormInput
        error="Senha inválida"
        inputTestID="password-input"
        label="Senha"
        value=""
      />,
    );

    expect(getByTestId("password-input").props.className).toContain("border-red-500");
  });
});