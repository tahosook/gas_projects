import { createNewSheet, getAmbidataJson, getYesterday } from "./util";

function hello(name: string): string {
  Logger.log(`Hello, ${name}!`);
  return `Hello, ${name}!`;
}

// main関数を定義
function main(): void {
  var SHEET_ID = "115A9fS5N8dMXOZLusWEJg8wlH7FtOcYPHcBlscx-jk8";
  var yesterday = getYesterday();

  var json = getAmbidataJson(
    "1140", // チャンネルID
    "f6ef7a046e8aee0a", // 読み取りキー
    yesterday // 日付
  );

  createNewSheet(SHEET_ID, yesterday, json);
}

// globalThisに登録
(globalThis as any).hello = hello;
