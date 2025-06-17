import { getYesterday, getAmbidataJson } from "../src/util";

// test
describe("Util Tests", () => {
  it("should return the correct value for getYesterday", () => {
    const yesterday = getYesterday();
    expect(yesterday).toBeDefined();

    // Check if the format is "yyyy-MM-dd"
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    expect(yesterday).toMatch(regex);

    var date = new Date();
    date.setDate(date.getDate() - 1);    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    expect(yesterday).toBe( `${year}-${month}-${day}`);
  });

  it("ambidata.io からデータ取得", async () => {
    const channelId = "1140";
    const readKey = "f6ef7a046e8aee0a";
    const date = "2025-01-01";
    const json = await getAmbidataJson(channelId, readKey, date);
    expect(json).toBeDefined();
    expect(typeof json).toBe("object");
  });
});
