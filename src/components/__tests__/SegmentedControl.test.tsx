import { fireEvent, render } from "@testing-library/react-native";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

describe("SegmentedControl", () => {
  it("renders all options", () => {
    const { getByText } = render(
      <SegmentedControl
        onChange={jest.fn()}
        options={[
          { label: "Entrar", value: "login" },
          { label: "Criar conta", value: "register" },
        ]}
        value="login"
      />,
    );

    expect(getByText("Entrar")).toBeTruthy();
    expect(getByText("Criar conta")).toBeTruthy();
  });

  it("calls onChange with the selected option", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <SegmentedControl
        onChange={onChange}
        optionTestIDPrefix="auth-mode"
        options={[
          { label: "Entrar", value: "login" },
          { label: "Criar conta", value: "register" },
        ]}
        value="login"
      />,
    );

    fireEvent.press(getByTestId("auth-mode-register"));

    expect(onChange).toHaveBeenCalledWith("register");
  });

  it("marks the active option visually", () => {
    const { getByTestId } = render(
      <SegmentedControl
        onChange={jest.fn()}
        optionTestIDPrefix="auth-mode"
        options={[
          { label: "Entrar", value: "login" },
          { label: "Criar conta", value: "register" },
        ]}
        value="register"
      />,
    );

    expect(getByTestId("auth-mode-register").props.className).toContain("bg-card");
    expect(getByTestId("auth-mode-login").props.className).toContain("bg-transparent");
  });
});