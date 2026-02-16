import React from "react";
import { render, screen, waitFor, fireEvent } from "@/lib/test-utils";
import { IdentityStep } from "./IdentityStep";
import { IDENTITY_AREAS } from "@/lib/identity-context";

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

describe("IdentityStep", () => {
  const defaultProps = {
    identityAreaId: "",
    setIdentityAreaId: jest.fn(),
    customIdentity: "",
    setCustomIdentity: jest.fn(),
    inputBorder: jest.fn(() => ({})),
    focusProps: jest.fn(() => ({})),
    colors: mockColors,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders identity area chips", async () => {
    render(<IdentityStep {...defaultProps} />);

    await waitFor(() => {
      // Verify at least 3 identity area labels appear
      expect(screen.getByText("An athlete")).toBeOnTheScreen();
      expect(screen.getByText("A reader")).toBeOnTheScreen();
      expect(screen.getByText("A meditator")).toBeOnTheScreen();
    });
  });

  it("shows custom identity input when custom selected", async () => {
    render(<IdentityStep {...defaultProps} identityAreaId="custom" />);

    await waitFor(() => {
      // Verify TextInput with placeholder appears
      expect(screen.getByPlaceholderText(/e.g. a disciplined person/i)).toBeOnTheScreen();
    });
  });

  it("calls setIdentityAreaId when chip pressed", async () => {
    const setIdentityAreaId = jest.fn();
    render(<IdentityStep {...defaultProps} setIdentityAreaId={setIdentityAreaId} />);

    await waitFor(() => {
      expect(screen.getByText("An athlete")).toBeOnTheScreen();
    });

    // Press the athlete chip
    const athleteChip = screen.getByText("An athlete");
    fireEvent.press(athleteChip.parent!);

    expect(setIdentityAreaId).toHaveBeenCalledWith("athlete");
  });
});
