import { env } from "@/lib/env";
import { Err, Ok, Result, StatusError, StatusOK } from "@baza/shared-types";
import * as SecureStore from "expo-secure-store";

interface FetchOptions extends RequestInit {
  json?: Record<string, any>;
}

/**
 * An API client wrapper that prefixes URLs with the base server URL,
 * handles default headers, and parses JSON responses.
 *
 * @param path The relative path to the API endpoint (e.g. "/v1/restricted/users/username")
 * @param options Standard RequestInit options plus an optional `json` body parameter
 * @throws If the fetch call fails due to network issues or CORS errors
 */
export async function apiClient(
  path: string,
  options: FetchOptions = {},
): Promise<Result<StatusOK<unknown>, StatusError>> {
  const url = `${env.EXPO_PUBLIC_SERVER_URL}${path}`;
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

  // If fetch throws a native exception (e.g. network/CORS error), let it propagate
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    return Err(data as StatusError);
  }

  return Ok(data as StatusOK<unknown>);
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
