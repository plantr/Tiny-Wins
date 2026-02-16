import { generateId } from "./id";

describe("generateId", () => {
  describe("format tests", () => {
    it("returns a string (not undefined or null)", () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(id).not.toBeNull();
      expect(typeof id).toBe("string");
    });

    it("returns a string of at least 13 characters (timestamp portion)", () => {
      const id = generateId();
      expect(id.length).toBeGreaterThanOrEqual(13);
    });

    it("matches pattern /^\\d+[a-z0-9]+$/ (digits followed by alphanumeric)", () => {
      const id = generateId();
      expect(id).toMatch(/^\d+[a-z0-9]+$/);
    });

    it("typeof generateId() is 'string'", () => {
      const result = generateId();
      expect(typeof result).toBe("string");
    });
  });

  describe("uniqueness tests", () => {
    it("generates 100 unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it("generates different IDs on consecutive calls", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
