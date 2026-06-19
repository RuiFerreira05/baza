/* eslint-disable @typescript-eslint/no-require-imports */
describe("env module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should parse correctly when all required environment variables are set", () => {
    process.env.EXPO_PUBLIC_SERVER_URL = "https://baza-api.example.com";
    process.env.EXPO_PUBLIC_BYPASS_AUTH = "false";

    const { env } = require("../src/lib/env");

    expect(env.EXPO_PUBLIC_SERVER_URL).toBe("https://baza-api.example.com");
    expect(env.EXPO_PUBLIC_BYPASS_AUTH).toBe("false");
  });

  it("should throw an error on import if EXPO_PUBLIC_SERVER_URL is missing", () => {
    delete process.env.EXPO_PUBLIC_SERVER_URL;
    process.env.EXPO_PUBLIC_BYPASS_AUTH = "true";

    expect(() => {
      require("../src/lib/env");
    }).toThrow();
  });

  it("should throw an error on import if EXPO_PUBLIC_BYPASS_AUTH is missing", () => {
    process.env.EXPO_PUBLIC_SERVER_URL = "http://localhost:3000";
    delete process.env.EXPO_PUBLIC_BYPASS_AUTH;

    expect(() => {
      require("../src/lib/env");
    }).toThrow();
  });
});
