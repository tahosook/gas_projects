function hello(name: string): string {
  Logger.log(`Hello, ${name}!`);
  return `Hello, ${name}!`;
}

// globalThisに登録
(globalThis as any).hello = hello;