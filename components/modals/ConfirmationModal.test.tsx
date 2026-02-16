import React from "react";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it("renders title and message when visible", async () => {
    render(
      <ConfirmationModal
        visible={true}
        icon="trash-outline"
        iconColor="#FF3B7F"
        title="delete habit"
        message="are you sure?"
        confirmLabel="delete"
        confirmColor="#FF3B7F"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("delete habit")).toBeTruthy();
      expect(screen.getByText("are you sure?")).toBeTruthy();
    });
  });

  it("calls onConfirm when confirm button pressed", async () => {
    render(
      <ConfirmationModal
        visible={true}
        icon="trash-outline"
        iconColor="#FF3B7F"
        title="delete habit"
        message="are you sure?"
        confirmLabel="delete"
        confirmColor="#FF3B7F"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      const confirmButton = screen.getByText("delete");
      fireEvent.press(confirmButton);
    });
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button pressed", async () => {
    render(
      <ConfirmationModal
        visible={true}
        icon="trash-outline"
        iconColor="#FF3B7F"
        title="delete habit"
        message="are you sure?"
        confirmLabel="delete"
        confirmColor="#FF3B7F"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      const cancelButton = screen.getByText("cancel");
      fireEvent.press(cancelButton);
    });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
