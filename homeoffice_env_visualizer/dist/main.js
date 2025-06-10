"use strict";
function hello(name) {
    Logger.log(`Hello, ${name}!`);
    return `Hello, ${name}!`;
}
// main関数を定義
function main() {
    var yesterday = getYesterday();
}
// globalThisに登録
globalThis.hello = hello;
