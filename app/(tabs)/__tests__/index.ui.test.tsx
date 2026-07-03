import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Pressable, Text as RNText } from "react-native";

import { HomeScreen, type HomeEvent } from "@/features/home";

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/design-system", () => {
  const { Pressable: RNPressable, Text: RNTextNode } = require("react-native");

  return {
    Avatar: ({ name }: { name: string }) => <RNTextNode>{name}</RNTextNode>,
    Button: ({ label, onPress }: { label: string; onPress?: () => void }) => (
      <RNPressable onPress={onPress} accessibilityRole="button">
        <RNTextNode>{label}</RNTextNode>
      </RNPressable>
    ),
    Text: ({ children }: { children: React.ReactNode }) => (
      <RNTextNode>{children}</RNTextNode>
    ),
    useTheme: () => ({
      colors: {
        background: "#fff",
        surface: "#fff",
        border: "#eee",
        textMuted: "#888",
        surfaceAlt: "#f5f5f5",
        text: "#111",
        primary: "#0a0",
        onPrimary: "#fff",
        primaryText: "#060",
        error: "#f00",
      },
      radius: { xl: 16 },
      iconStrokeWidth: 1.75,
    }),
  };
});

const EVENTS: HomeEvent[] = [
  {
    id: "evt-1",
    type: "Corrida",
    category: "corrida",
    title: "Maratona Centro",
    city: "Sao Paulo, SP",
    dateLabel: "10 jul",
    day: "10",
    mon: "JUL",
    price: "R$ 99",
    attendeesLabel: "200 indo",
    hot: true,
    image: { uri: "https://example.com/a.jpg" },
  },
  {
    id: "evt-2",
    type: "Yoga",
    category: "yoga",
    title: "Yoga no Parque",
    city: "Campinas, SP",
    dateLabel: "11 jul",
    day: "11",
    mon: "JUL",
    price: "R$ 50",
    attendeesLabel: "80 indo",
    hot: false,
    image: { uri: "https://example.com/b.jpg" },
  },
];

describe("HomeScreen UI", () => {
  it("chama onSeeAll ao pressionar Ver todos", () => {
    const onSeeAll = jest.fn();

    const { getAllByText } = render(
      <HomeScreen
        userName="Andre"
        city="Brasil"
        events={EVENTS}
        onSeeAll={onSeeAll}
      />,
    );

    fireEvent.press(getAllByText("Ver todos")[0] as unknown as Pressable);

    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });

  it("filtra pelo campo de busca e oculta secoes de destaque", () => {
    const { getByLabelText, queryByText } = render(
      <HomeScreen userName="Andre" city="Brasil" events={EVENTS} />,
    );

    fireEvent.changeText(getByLabelText("Buscar"), "futebol inexistente");

    expect(queryByText("Destaques")).toBeNull();
    expect(queryByText("Em alta")).toBeNull();
  });

  it("chama onOpenNotifications ao pressionar botao de notificacoes", () => {
    const onOpenNotifications = jest.fn();

    const { getByLabelText } = render(
      <HomeScreen
        userName="Andre"
        city="Brasil"
        events={EVENTS}
        onOpenNotifications={onOpenNotifications}
      />,
    );

    fireEvent.press(getByLabelText("Notificações"));

    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });
});
