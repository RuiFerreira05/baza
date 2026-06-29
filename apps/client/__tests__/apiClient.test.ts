import { apiClient, unwrapResult } from "@/services/apiClient";
import { Err, ErrorTypes, Ok, createStatusError } from "@baza/shared-types";
import * as SecureStore from "expo-secure-store";

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  deleteItem: jest.fn(),
}));

describe("apiClient", () => {
  const mockFetch = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).fetch = mockFetch;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should inject Cookie header if session cookies exist in SecureStore", async () => {
    const mockCookie = JSON.stringify({
      "baza_session_token": { value: "mocked_token", expires: null }
    });
    (SecureStore.getItem as jest.Mock).mockReturnValue(mockCookie);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "OK", data: { id: 1 } }),
    });

    const result = await apiClient("/v1/test");

    expect(SecureStore.getItem).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-server.com/v1/test",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get("Cookie")).toBe("baza_session_token=mocked_token");
    expect(headers.get("Accept")).toBe("application/json");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ status: "OK", data: { id: 1 } });
    }
  });

  it("should format query parameters and serialize them", async () => {
    (SecureStore.getItem as jest.Mock).mockReturnValue(null);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "OK", data: null }),
    });

    await apiClient("/v1/test", {
      params: {
        filter: "active",
        page: 2,
        skipped: undefined,
        flag: true,
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-server.com/v1/test?filter=active&page=2&flag=true",
      expect.any(Object),
    );
  });

  it("should handle JSON post requests correctly", async () => {
    (SecureStore.getItem as jest.Mock).mockReturnValue(null);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "OK", data: { created: true } }),
    });

    await apiClient("/v1/test", {
      method: "POST",
      json: { name: "Test Group" },
    });

    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(mockFetch.mock.calls[0][1].body).toBe(
      JSON.stringify({ name: "Test Group" }),
    );
  });

  it("should return Ok(null) when server returns 204 No Content", async () => {
    mockFetch.mockResolvedValue({
      status: 204,
      ok: true,
      headers: new Headers(),
    });

    const result = await apiClient("/v1/delete");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ status: "OK", data: null });
    }
  });

  it("should handle non-JSON server responses gracefully by creating a ConnectionError", async () => {
    mockFetch.mockResolvedValue({
      status: 502,
      statusText: "Bad Gateway",
      ok: false,
      headers: new Headers({ "content-type": "text/html" }),
    });

    const result = await apiClient("/v1/bad-path");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.type).toBe(ErrorTypes.ConnectionError);
      expect(result.error.error.message).toContain("502");
    }
  });

  it("should return parsed StatusError directly if the server returns a conforming StatusError", async () => {
    const errorBody = {
      status: "ERROR",
      error: {
        type: ErrorTypes.UnauthorizedError,
        message: "Session expired",
      },
    };
    mockFetch.mockResolvedValue({
      status: 401,
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errorBody,
    });

    const result = await apiClient("/v1/protected");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual(errorBody);
    }
  });

  it("should normalize non-conforming JSON error responses into MalformedRequestError", async () => {
    const nonConformingError = {
      message: "Required parameter id is missing",
      statusCode: 400,
    };
    mockFetch.mockResolvedValue({
      status: 400,
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => nonConformingError,
    });

    const result = await apiClient("/v1/bad-params");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.type).toBe(ErrorTypes.MalformedRequestError);
      expect(result.error.error.message).toBe(
        "Required parameter id is missing",
      );
    }
  });

  it("should catch fetch throws and return a ConnectionError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await apiClient("/v1/network-fail");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.type).toBe(ErrorTypes.ConnectionError);
      expect(result.error.error.message).toBe(
        "Failed to connect to the server",
      );
    }
  });

  it("should append query parameters with & if the path already contains a query string", async () => {
    (SecureStore.getItem as jest.Mock).mockReturnValue(null);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "OK", data: null }),
    });

    await apiClient("/v1/test?existing=yes", {
      params: { page: 2 },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-server.com/v1/test?existing=yes&page=2",
      expect.any(Object),
    );
  });

  it("should use data.error message if message is missing in non-conforming error response", async () => {
    const errorBody = {
      error: "Detailed error content",
    };
    mockFetch.mockResolvedValue({
      status: 400,
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errorBody,
    });

    const result = await apiClient("/v1/bad-request");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.type).toBe(ErrorTypes.MalformedRequestError);
      expect(result.error.error.message).toBe("Detailed error content");
    }
  });

  it("should not append any query parameters if params object produces an empty query string", async () => {
    (SecureStore.getItem as jest.Mock).mockReturnValue(null);
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "OK", data: null }),
    });

    await apiClient("/v1/test", {
      params: { page: undefined },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-server.com/v1/test",
      expect.any(Object),
    );
  });

  it("should fallback to default error message if both message and error are missing in non-conforming error response", async () => {
    const errorBody = {};
    mockFetch.mockResolvedValue({
      status: 400,
      statusText: "Bad Request",
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errorBody,
    });

    const result = await apiClient("/v1/bad-request-empty");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error.type).toBe(ErrorTypes.MalformedRequestError);
      expect(result.error.error.message).toBe("Server returned status 400");
    }
  });

  describe("unwrapResult", () => {
    it("should extract internal data on Ok result", () => {
      const okResult = Ok({ status: "OK" as const, data: "my-payload" });
      const unwrapped = unwrapResult<string>(okResult);
      expect(unwrapped).toEqual(Ok("my-payload"));
    });

    it("should return the original Err on fail", () => {
      const errResult = Err(
        createStatusError(ErrorTypes.UnknownIdError, "Not Found"),
      );
      const unwrapped = unwrapResult(errResult);
      expect(unwrapped).toEqual(errResult);
    });
  });
});
