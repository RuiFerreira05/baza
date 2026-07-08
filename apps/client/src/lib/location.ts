export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Parsed and formats a location string.
 * If the location is a JSON string of LocationData, returns the name.
 * Otherwise, returns the location string as-is.
 */
export function formatLocation(location: string | null | undefined): string {
  if (!location) return "";
  try {
    const trimmed = location.trim();
    if (trimmed.startsWith("{")) {
      const parsed = JSON.parse(trimmed);
      if (
        parsed &&
        typeof parsed === "object" &&
        "name" in parsed &&
        typeof parsed.name === "string"
      ) {
        return parsed.name;
      }
    }
  } catch {}
  return location;
}
