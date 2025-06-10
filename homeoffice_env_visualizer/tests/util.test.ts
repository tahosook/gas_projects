import { getYesterday } from "../src/util";

describe("Util Tests", () => {
  it("should return the correct value for getYesterday", () => {
    const yesterday = getYesterday();
    expect(yesterday).toBeDefined();

    // Check if the format is "yyyy-MM-dd"
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    expect(yesterday).toMatch(regex);
  });
});
