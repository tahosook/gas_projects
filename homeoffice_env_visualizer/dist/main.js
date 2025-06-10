"use strict";
function hello(name) {
    Logger.log(`Hello, ${name}!`);
    return `Hello, ${name}!`;
}
// globalThisに登録
globalThis.hello = hello;
