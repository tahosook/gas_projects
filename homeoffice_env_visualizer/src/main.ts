import { getAmbidataJson, getYesterday } from "./util";

function hello(name: string): string {
  Logger.log(`Hello, ${name}!`);
  return `Hello, ${name}!`;
}

// main関数を定義
function main(): void {
  var yesterday = getYesterday();

  var json = getAmbidataJson(
    "1140", // チャンネルID
    "f6ef7a046e8aee0a", // 読み取りキー
    yesterday // 日付
  );

  
}

// globalThisに登録
(globalThis as any).hello = hello;
