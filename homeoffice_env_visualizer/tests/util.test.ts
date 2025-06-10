import { getYesterday } from "../src/util";

describe("Util Tests", () => {
  it("should return the correct value for getYesterday", () => {
    const yesterday = getYesterday();
    expect(yesterday).toBeDefined();
    const expectedYesterday = "2025-06-09";
    expect(yesterday).toBe(expectedYesterday);
  });
});
