import React from "react";
import { render, screen, waitFor } from "@/lib/test-utils";
import { SummaryStep } from "./SummaryStep";
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

describe("SummaryStep", () => {
  const defaultProps = {
    title: "",
    icon: "fitness",
    selectedColor: COLOR_OPTIONS[0],
    identityAreaId: "",
    customIdentity: "",
    intentionBehaviour: "",
    intentionTime: "",
    intentionLocation: "",
    stackAnchor: "",
    twoMinVersion: "",
    goal: "1",
    unit: "times",
    resolvedFrequency: "Daily",
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders habit title in summary card", async () => {
    render(<SummaryStep {...defaultProps} title="Morning Run" />);

    await waitFor(() => {
      expect(screen.getByText("Morning Run")).toBeOnTheScreen();
    });
  });

  it("renders target info", async () => {
    render(
      <SummaryStep
        {...defaultProps}
        goal="3"
        unit="times"
        resolvedFrequency="Daily"
      />
    );

    await waitFor(() => {
      // The target row shows: "3 times / Daily"
      expect(screen.getByText(/3 times \/ Daily/i)).toBeOnTheScreen();
    });
  });

  it("renders identity row when identityAreaId set", async () => {
    render(<SummaryStep {...defaultProps} identityAreaId="athlete" />);

    await waitFor(() => {
      expect(screen.getByText("identity:")).toBeOnTheScreen();
      expect(screen.getByText("An athlete")).toBeOnTheScreen();
    });
  });
});
