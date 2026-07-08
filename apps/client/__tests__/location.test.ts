import { formatLocation } from "../src/lib/location";

describe("formatLocation", () => {
  it("should return empty string if location is null, undefined, or empty", () => {
    expect(formatLocation(null)).toBe("");
    expect(formatLocation(undefined)).toBe("");
    expect(formatLocation("")).toBe("");
  });

  it("should return the original string if it is not a JSON string", () => {
    expect(formatLocation("Central Park")).toBe("Central Park");
    expect(formatLocation("123 Main St, New York")).toBe(
      "123 Main St, New York",
    );
  });

  it("should parse and return the name from a valid LocationData JSON string", () => {
    const serialized = JSON.stringify({
      name: "Time Square, NY",
      latitude: 40.758896,
      longitude: -73.98513,
    });
    expect(formatLocation(serialized)).toBe("Time Square, NY");
  });

  it("should fallback to the original JSON string if name field is missing", () => {
    const invalidJson = JSON.stringify({
      latitude: 40.758896,
      longitude: -73.98513,
    });
    expect(formatLocation(invalidJson)).toBe(invalidJson);
  });

  it("should fallback to the original string if parsing throws an error", () => {
    const malformedJson = "{name: 'Central Park', latitude: 40.758896";
    expect(formatLocation(malformedJson)).toBe(malformedJson);
  });
});
