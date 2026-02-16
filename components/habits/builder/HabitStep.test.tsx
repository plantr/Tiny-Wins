import React from "react";
import { render, screen, waitFor } from "@/lib/test-utils";
import { HabitStep } from "./HabitStep";
import { COLOR_OPTIONS } from "@/components/shared/constants";

const mockColors = {
  text: "#FFFFFF",
  textSecondary: "#999",
  textMuted: "#666",
  accent: "#FF3B7F",
  accentOrange: "#FF8C42",
  accentPurple: "#7B61FF",
  accentCyan: "#00E5C3",
  accentYellow: "#FFD600",
  background: "#0A0A0A",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  cardBorder: "#333",
};

describe("HabitStep", () => {
  const defaultProps = {
    title: "",
    setTitle: jest.fn(),
    icon: "fitness",
    setIcon: jest.fn(),
    colorIdx: 0,
    setColorIdx: jest.fn(),
    goal: "1",
    setGoal: jest.fn(),
    unit: "times",
    setUnit: jest.fn(),
    frequency: "Daily",
    setFrequency: jest.fn(),
    customInterval: "1",
    setCustomInterval: jest.fn(),
    customPeriod: "weeks" as const,
    setCustomPeriod: jest.fn(),
    customDays: [],
    toggleDay: jest.fn(),
    selectedColor: COLOR_OPTIONS[0],
    inputBorder: jest.fn(() => ({})),
    focusProps: jest.fn(() => ({})),
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders habit name input", async () => {
    render(<HabitStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Read, Meditate, Run/i)).toBeOnTheScreen();
    });
  });

  it("renders icon grid with all options", async () => {
    render(<HabitStep {...defaultProps} />);

    await waitFor(() => {
      // Verify multiple icon options render (checking text content since icons are mocked as text)
      expect(screen.getByText("water")).toBeOnTheScreen();
      expect(screen.getByText("fitness")).toBeOnTheScreen();
      expect(screen.getByText("book")).toBeOnTheScreen();
      expect(screen.getByText("leaf")).toBeOnTheScreen();
    });
  });

  it("renders frequency options", async () => {
    render(<HabitStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Daily")).toBeOnTheScreen();
      expect(screen.getByText("Weekdays")).toBeOnTheScreen();
      expect(screen.getByText("Custom")).toBeOnTheScreen();
    });
  });
});
