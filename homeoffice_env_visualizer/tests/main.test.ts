class LoggerMock {
  lastLog = '';
  log(data: string) {
    this.lastLog = data;
  }
  getLog() {
    return this.lastLog;
  }
}

import '../src/main';

describe('hello', () => {
  beforeEach(() => {
    (globalThis as any).Logger = new LoggerMock();
  });

  it('ログと戻り値が正しいこと', () => {
    const result = (globalThis as any).hello('GAS');
    expect(result).toBe('Hello, GAS!');
    expect((globalThis as any).Logger.getLog()).toBe('Hello, GAS!');
  });
});
