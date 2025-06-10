const { transform } = require("typescript");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    Logger: {}
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", {tsconfig: "tsconfig.test.json"}]
  },
};
