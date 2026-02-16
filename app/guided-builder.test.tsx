import React from "react";
import { render, screen, waitFor, fireEvent } from "@/lib/test-utils";
import GuidedBuilderScreen from "./guided-builder";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

describe("GuidedBuilderScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders first step (identity) on mount", async () => {
    render(<GuidedBuilderScreen />);

    await waitFor(() => {
      // Verify step 1 title and subtitle
      expect(screen.getByText("identity link")).toBeOnTheScreen();
      expect(screen.getByText("who do you want to become?")).toBeOnTheScreen();
      // Verify step counter shows "1/6"
      expect(screen.getByText("1/6")).toBeOnTheScreen();
    });
  });

  it("navigates to next step when Next pressed", async () => {
    render(<GuidedBuilderScreen />);

    // Wait for step 1 to render
    await waitFor(() => {
      expect(screen.getByText("identity link")).toBeOnTheScreen();
    });

    // Select an identity area (press a chip)
    const athleteChip = screen.getByText("An athlete");
    fireEvent.press(athleteChip.parent!);

    // Press the Next button
    const nextButton = screen.getByText("Next");
    fireEvent.press(nextButton.parent!);

    // Verify step 2 content appears
    await waitFor(() => {
      expect(screen.getByText("your habit")).toBeOnTheScreen();
      expect(screen.getByText("what will you do?")).toBeOnTheScreen();
      expect(screen.getByText("2/6")).toBeOnTheScreen();
    });
  });

  it("navigates back when back button pressed", async () => {
    render(<GuidedBuilderScreen />);

    // Wait for step 1 to render
    await waitFor(() => {
      expect(screen.getByText("identity link")).toBeOnTheScreen();
    });

    // Select an identity area and navigate to step 2
    const athleteChip = screen.getByText("An athlete");
    fireEvent.press(athleteChip.parent!);

    const nextButton = screen.getByText("Next");
    fireEvent.press(nextButton.parent!);

    // Wait for step 2
    await waitFor(() => {
      expect(screen.getByText("your habit")).toBeOnTheScreen();
    });

    // Press back button (arrow-left icon)
    const backButton = screen.getByText("arrow-left");
    fireEvent.press(backButton.parent!);

    // Verify step 1 content reappears
    await waitFor(() => {
      expect(screen.getByText("identity link")).toBeOnTheScreen();
      expect(screen.getByText("1/6")).toBeOnTheScreen();
    });
  });

  it("disables Next button when required field empty", async () => {
    render(<GuidedBuilderScreen />);

    // Wait for step 1 to render
    await waitFor(() => {
      expect(screen.getByText("identity link")).toBeOnTheScreen();
    });

    // The disabled state can be verified by checking that the arrow-right icon exists
    // (which is always present in the Next button)
    const arrowIcon = screen.getByText("arrow-right");
    expect(arrowIcon).toBeOnTheScreen();

    // When enabled, pressing Next would work. When disabled, pressing should not navigate.
    // Since we can't directly test the opacity, we verify behavior instead.
    // The button should NOT navigate to step 2 when no identity is selected.
    const nextButton = screen.getByText("Next");

    // Try to press it - it shouldn't navigate because identityAreaId is empty
    fireEvent.press(nextButton.parent!.parent!);

    // Verify we're still on step 1
    expect(screen.getByText("identity link")).toBeOnTheScreen();
    expect(screen.getByText("1/6")).toBeOnTheScreen();
  });
});
