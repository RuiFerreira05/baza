import { env } from "@/lib/env";
import {
  createStatusError,
  Err,
  ErrorTypes,
  Ok,
  Result,
  StatusError,
  StatusOK,
} from "@baza/shared-types";
import * as SecureStore from "expo-secure-store";

interface FetchOptions extends RequestInit {
  json?: Record<string, any>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * An API client wrapper that prefixes URLs with the base server URL,
 * handles default headers, and parses JSON responses.
 *
 * @param path The relative path to the API endpoint (e.g. "/v1/restricted/users/username")
 * @param options Standard RequestInit options plus an optional `json` body parameter
 */
export async function apiClient(
  path: string,
  options: FetchOptions = {},
): Promise<Result<StatusOK<unknown>, StatusError>> {
  let url = `${env.EXPO_PUBLIC_SERVER_URL}${path}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers = new Headers(options.headers);

  // Read the active session token from SecureStore and inject as Bearer token
  const token = await SecureStore.getItemAsync("baza_session_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Accept", "application/json");
  if (options.json) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return Ok({ status: "OK", data: null as unknown });
    }

    const contentType = response.headers.get("content-type");
    let data: any;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = createStatusError(
        ErrorTypes.ConnectionError,
        `Server returned status ${response.status}: ${response.statusText}`,
      );
    }

    if (!response.ok) {
      const isStatusError =
        data && data.status === "ERROR" && typeof data.error === "object";
      // If the server returned an error but it wasn't in the expected format, create a generic
      // StatusError for it
      if (!isStatusError) {
        const message =
          data?.message ||
          data?.error ||
          `Server returned status ${response.status}`;
        data = createStatusError(ErrorTypes.MalformedRequestError, message);
      }
      return Err(data as StatusError);
    }

    return Ok(data as StatusOK<unknown>);
  } catch (error: any) {
    console.error(`API request failed [${path}]:`, error);
    return Err(
      createStatusError(
        ErrorTypes.ConnectionError,
        "Failed to connect to the server",
      ),
    );
  }
}

/**
 * Maps the generic Result<StatusOK<unknown>, StatusError> to Result<T, StatusError>
 * by unwrapping the data envelope.
 */
export function unwrapResult<T>(
  result: Result<StatusOK<unknown>, StatusError>,
): Result<T, StatusError> {
  if (!result.ok) {
    return result;
  }
  return Ok(result.value.data as T);
}
