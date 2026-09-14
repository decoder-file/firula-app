import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { CategoryCard, resolveCategoryState } from "@/features/voting/components/CategoryCard";
import type { MyVotingStatus, VotingCategorySummary } from "@/services/voting.service";

jest.mock("@/components/AnimatedPressable", () => {
  const { Pressable } = require("react-native");
  return { AnimatedPressable: (props: Record<string, unknown>) => <Pressable {...props} /> };
});

jest.mock("@/design-system", () => {
  const { Text: RNText, View } = require("react-native");
  return {
    Badge: ({ label }: { label: string }) => <RNText>{label}</RNText>,
    Surface: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Text: ({ children }: { children: React.ReactNode }) => <RNText>{children}</RNText>,
    useTheme: () => ({
      colors: { primary: "#1FBD63", primaryText: "#12813F", textMuted: "#5C6470", border: "#E7EAEE" },
      spacing: { s1: 4, s3: 12, s4: 16 },
    }),
  };
});

const category = (overrides: Partial<VotingCategorySummary> = {}): VotingCategorySummary => ({
  id: "cat-14",
  name: "SUB-14",
  slug: "sub-14",
  displayOrder: 0,
  status: "OPEN",
  votingStartsAt: null,
  votingEndsAt: null,
  resultsPublished: false,
  positionsCount: 11,
  ...overrides,
});

const me = (overrides: Partial<MyVotingStatus> = {}): MyVotingStatus => ({
  eligibleCategoryIds: ["cat-14"],
  votedCategoryIds: [],
  votes: [],
  canVotePublic: true,
  ...overrides,
});

describe("resolveCategoryState", () => {
  it("prioritizes 'voted', then eligibility on open categories, then the schedule status", () => {
    expect(resolveCategoryState(category(), null)).toBe("vote");
    expect(resolveCategoryState(category(), me({ votedCategoryIds: ["cat-14"] }))).toBe("voted");
    expect(resolveCategoryState(category(), me({ eligibleCategoryIds: [] }))).toBe("restricted");
    expect(resolveCategoryState(category({ status: "SCHEDULED" }), me())).toBe("scheduled");
    expect(resolveCategoryState(category({ status: "PAUSED" }), me())).toBe("paused");
    expect(resolveCategoryState(category({ status: "RESULTS_PUBLISHED", resultsPublished: true }), me())).toBe("closed");
  });
});

describe("CategoryCard", () => {
  const handlers = () => ({ onVote: jest.fn(), onViewSelection: jest.fn(), onViewResults: jest.fn() });

  it("open + eligible → tapping starts the vote", () => {
    const h = handlers();
    const { getByText, getByLabelText } = render(<CategoryCard category={category()} editionShortName="Mineiro 26" me={me()} {...h} />);
    expect(getByText("Aberta")).toBeTruthy();
    fireEvent.press(getByLabelText(/SUB-14/));
    expect(h.onVote).toHaveBeenCalled();
  });

  it("already voted → tapping opens my selection, never the ballot", () => {
    const h = handlers();
    const { getByText, getByLabelText } = render(<CategoryCard category={category()} editionShortName="Mineiro 26" me={me({ votedCategoryIds: ["cat-14"] })} {...h} />);
    expect(getByText("Concluída")).toBeTruthy();
    fireEvent.press(getByLabelText(/SUB-14/));
    expect(h.onViewSelection).toHaveBeenCalled();
    expect(h.onVote).not.toHaveBeenCalled();
  });

  it("closed with published results → tapping opens the results; closed without → not tappable", () => {
    const h = handlers();
    const { getByLabelText, rerender } = render(
      <CategoryCard category={category({ status: "RESULTS_PUBLISHED", resultsPublished: true })} editionShortName="Mineiro 26" me={me()} {...h} />,
    );
    fireEvent.press(getByLabelText(/SUB-14/));
    expect(h.onViewResults).toHaveBeenCalled();

    rerender(<CategoryCard category={category({ status: "CLOSED" })} editionShortName="Mineiro 26" me={me()} {...h} />);
    fireEvent.press(getByLabelText(/SUB-14/));
    expect(h.onViewResults).toHaveBeenCalledTimes(1);
  });
});
