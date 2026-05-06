import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { IconButton } from "@/components/ui/IconButton";

describe("IconButton", () => {
  it("calls onPress when enabled", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton
        accessibilityLabel="Voltar"
        icon={<Text>icon</Text>}
        onPress={onPress}
        testID="icon-button"
      />,
    );

    fireEvent.press(getByTestId("icon-button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies disabled styling when disabled", () => {
    const { getByTestId } = render(
      <IconButton
        accessibilityLabel="Voltar"
        disabled
        icon={<Text>icon</Text>}
        onPress={jest.fn()}
        testID="icon-button"
      />,
    );

    expect(getByTestId("icon-button").props.className).toContain("opacity-60");
  });
});