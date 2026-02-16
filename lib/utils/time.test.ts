import { formatTime } from "./time";

describe("formatTime", () => {
  describe("morning hours", () => {
    it("converts 07:30 to 7:30 am", () => {
      expect(formatTime("07:30")).toBe("7:30 am");
    });

    it("converts 09:00 to 9:00 am", () => {
      expect(formatTime("09:00")).toBe("9:00 am");
    });
  });

  describe("afternoon/evening hours", () => {
    it("converts 13:30 to 1:30 pm", () => {
      expect(formatTime("13:30")).toBe("1:30 pm");
    });

    it("converts 23:45 to 11:45 pm", () => {
      expect(formatTime("23:45")).toBe("11:45 pm");
    });
  });

  describe("midnight edge case", () => {
    it("converts 00:00 to 12:00 am", () => {
      expect(formatTime("00:00")).toBe("12:00 am");
    });

    it("converts 00:30 to 12:30 am", () => {
      expect(formatTime("00:30")).toBe("12:30 am");
    });
  });

  describe("noon edge case", () => {
    it("converts 12:00 to 12:00 pm", () => {
      expect(formatTime("12:00")).toBe("12:00 pm");
    });

    it("converts 12:30 to 12:30 pm", () => {
      expect(formatTime("12:30")).toBe("12:30 pm");
    });
  });

  describe("minute padding preserved", () => {
    it("converts 07:05 to 7:05 am (preserves leading zero in minutes)", () => {
      expect(formatTime("07:05")).toBe("7:05 am");
    });

    it("converts 14:09 to 2:09 pm (preserves leading zero in minutes)", () => {
      expect(formatTime("14:09")).toBe("2:09 pm");
    });
  });

  describe("boundary cases", () => {
    it("converts 11:59 to 11:59 am (last AM minute)", () => {
      expect(formatTime("11:59")).toBe("11:59 am");
    });
  });
});
