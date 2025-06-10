import { hello } from '../src/main';

class LoggerMock {
  lastLog = '';
  log(data: string) {
    this.lastLog = data;
  }
  getLog() {
    return this.lastLog;
  }
}

describe('hello', () => {
  beforeEach(() => {
    (global as any).Logger = new LoggerMock();
  });

  it('ログと戻り値が正しいこと', () => {
    const result = hello('GAS');
    expect(result).toBe('Hello, GAS!');
    expect((global as any).Logger.getLog()).toBe('Hello, GAS!');
  });
});
