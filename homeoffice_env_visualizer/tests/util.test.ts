import { getYesterday, getAmbidataJson, createNewSheet } from "../src/util";

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

    // Check the structure of the data
    if (Array.isArray(json) && json.length > 0) {
      const firstEntry = json[0];
      expect(typeof firstEntry).toBe("object");
      expect(firstEntry).toHaveProperty("d1");
      expect(firstEntry).toHaveProperty("d2");
      expect(firstEntry).toHaveProperty("d3");
      expect(firstEntry).toHaveProperty("created");
      expect(typeof firstEntry.d1).toBe("number");
      expect(typeof firstEntry.d2).toBe("number");
      expect(typeof firstEntry.d3).toBe("number");
      expect(typeof firstEntry.created).toBe("string");
    }
  });

  it("createNewSheet 関数がエラーを発生させずに実行されること", () => {
    // テスト用の引数
    const sheetId = "testSheetId";
    const sheetName = "testSheetName";
    const json = [{ created: "2025-01-01T00:00:00Z", d1: 1, d2: 2, d3: 3 }];

    // createNewSheet 関数を呼び出す (実際には Google Apps Script の環境が必要)
    // ここでは、関数が定義されていること、およびエラーが発生しないことを確認する
    expect(() => {
      // @ts-ignore
      createNewSheet(sheetId, sheetName, json);
    }).not.toThrow();
  });
});
