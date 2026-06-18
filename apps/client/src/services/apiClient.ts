import { env } from "@/lib/env";
import * as SecureStore from "expo-secure-store";

interface FetchOptions extends RequestInit {
  json?: Record<string, any>;
}

/**
 * A type-safe API client wrapper that prefixes URLs with the base server URL,
 * handles default headers, and parses JSON responses.
 * 
 * @param path The relative path to the API endpoint (e.g. "/v1/restricted/users/username")
 * @param options Standard RequestInit options plus an optional `json` body parameter
 */
export async function apiClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || "An unexpected network error occurred",
      errorType: data?.errorType,
    };
  }

  return data as T;
}
