import { getYesterday } from "./util";

function hello(name: string): string {
  Logger.log(`Hello, ${name}!`);
  return `Hello, ${name}!`;
}

// main関数を定義
function main(): void {
  var yesterday = getYesterday();
}

// globalThisに登録
(globalThis as any).hello = hello;
