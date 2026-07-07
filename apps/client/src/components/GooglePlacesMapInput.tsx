/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { env } from "@/lib/env";
import { useAppTheme } from "@/hooks/useAppTheme";

// Graceful import of expo-maps in case it's run in environments where it isn't linked
let AppleMaps: any = null;
let GoogleMaps: any = null;
try {
  const ExpoMaps = require("expo-maps");
  AppleMaps = ExpoMaps.AppleMaps;
  GoogleMaps = ExpoMaps.GoogleMaps;
} catch (e) {
  console.warn(
    "expo-maps package could not be loaded statically. Map previews will be disabled.",
  );
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationData = {
  name: string;
  latitude: number;
  longitude: number;
};

type GooglePlacesMapInputProps = {
  label: string;
  value: string; // Serialized LocationData JSON string or plain text
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Called when the user starts/stops touching the map, so parent scroll containers can yield gesture control. */
  onMapInteraction?: (isInteracting: boolean) => void;
};

// Default center coordinates (e.g. Lisbon, Portugal)
const DEFAULT_COORDS: Coordinates = {
  latitude: 38.7223,
  longitude: -9.1393,
};

export default function GooglePlacesMapInput({
  label,
  value,
  onChangeText,
  placeholder,
  onMapInteraction,
}: GooglePlacesMapInputProps) {
  const { colors, isDark } = useAppTheme();
  const apiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Parse location details
  const parseLocation = (val: string): LocationData | null => {
    if (!val) return null;
    try {
      if (val.trim().startsWith("{")) {
        const parsed = JSON.parse(val);
        if (
          parsed &&
          typeof parsed === "object" &&
          "latitude" in parsed &&
          "longitude" in parsed
        ) {
          return parsed as LocationData;
        }
      }
    } catch (_) {}
    return null;
  };

  const parsedLoc = parseLocation(value);
  const displayName = parsedLoc ? parsedLoc.name : value;

  const [searchText, setSearchText] = useState(displayName);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(
    parsedLoc
      ? { latitude: parsedLoc.latitude, longitude: parsedLoc.longitude }
      : null,
  );

  const [cameraPosition, setCameraPosition] = useState<{
    coordinates: Coordinates;
    zoom: number;
  }>(() => {
    const freshLoc = parseLocation(value);
    return {
      coordinates: freshLoc
        ? { latitude: freshLoc.latitude, longitude: freshLoc.longitude }
        : DEFAULT_COORDS,
      zoom: freshLoc ? 15 : 12,
    };
  });

  const isMapClickUpdate = useRef(false);
  const isUserTyping = useRef(false);

  // Sync state if value changes externally
  useEffect(() => {
    const freshLoc = parseLocation(value);
    if (freshLoc) {
      const newCoords = {
        latitude: freshLoc.latitude,
        longitude: freshLoc.longitude,
      };
      setSearchText(freshLoc.name);
      setCoords(newCoords);
      if (!isMapClickUpdate.current) {
        setCameraPosition({
          coordinates: newCoords,
          zoom: 15,
        });
      }
    } else {
      setSearchText(value);
      setCoords(null);
    }
    isMapClickUpdate.current = false;
  }, [value]);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      setLoadingSuggestions(true);
      try {
        const url = `https://places.googleapis.com/v1/places:autocomplete`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey || "",
            "X-Goog-FieldMask":
              "suggestions.placePrediction.text,suggestions.placePrediction.placeId",
          },
          body: JSON.stringify({
            input,
          }),
        });
        const data = await res.json();

        if (data && data.suggestions) {
          const formattedSuggestions = data.suggestions.map((s: any) => ({
            place_id: s.placePrediction.placeId,
            description: s.placePrediction.text.text,
          }));
          setSuggestions(formattedSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Error fetching places autocomplete suggestions:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [apiKey],
  );

  // Debounced search for Places Autocomplete
  useEffect(() => {
    if (!apiKey || !searchText.trim()) {
      setSuggestions([]);
      return;
    }

    if (searchText === displayName && !isUserTyping.current) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      isUserTyping.current = false;
      fetchSuggestions(searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, displayName, apiKey, fetchSuggestions]);

  const handleSelectSuggestion = async (
    placeId: string,
    description: string,
  ) => {
    setSuggestions([]);
    setSearchText(description);
    setLoadingSuggestions(true);

    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey || "",
          "X-Goog-FieldMask": "id,location",
        },
      });
      const data = await res.json();

      const location = data?.location;
      if (
        location &&
        typeof location.latitude === "number" &&
        typeof location.longitude === "number"
      ) {
        const newCoords: Coordinates = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        setCoords(newCoords);
        setCameraPosition({
          coordinates: newCoords,
          zoom: 15,
        });

        // Serialize structured location to DB
        const savedValue: LocationData = {
          name: description,
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
        };
        onChangeText(JSON.stringify(savedValue));
      } else {
        // Fallback to plain text description
        onChangeText(description);
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
      onChangeText(description);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleMapClick = async (clickedCoords: Coordinates) => {
    if (!apiKey) return;
    isMapClickUpdate.current = true;
    setCoords(clickedCoords);
    setLoadingSuggestions(true);

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${clickedCoords.latitude},${clickedCoords.longitude}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.warn(
          "Google Geocoding API returned non-OK status:",
          data.status,
          data.error_message || "Check if Geocoding API is enabled in GCP.",
        );
      }

      const address =
        data?.results?.[0]?.formatted_address ||
        `Coordinates: ${clickedCoords.latitude.toFixed(4)}, ${clickedCoords.longitude.toFixed(4)}`;

      setSearchText(address);

      const savedValue: LocationData = {
        name: address,
        latitude: clickedCoords.latitude,
        longitude: clickedCoords.longitude,
      };
      onChangeText(JSON.stringify(savedValue));
    } catch (err) {
      console.error("Error in reverse geocoding map click:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleTextChange = (text: string) => {
    isUserTyping.current = true;
    setSearchText(text);
    // Directly save to parent so plain text works out of the box if no suggestion is picked
    onChangeText(text);
    if (!text.trim()) {
      setCoords(null);
    }
  };

  // Render Map View
  const renderMap = () => {
    if (!AppleMaps || !GoogleMaps) return null;

    const markers = coords
      ? [
          {
            id: "selected-location-pin",
            coordinates: coords,
            title: displayName,
          },
        ]
      : [];

    try {
      if (Platform.OS === "ios") {
        return (
          <AppleMaps.View
            cameraPosition={cameraPosition}
            markers={markers}
            style={styles.map}
            onMapClick={(e: any) => handleMapClick(e.coordinates)}
            colorScheme={isDark ? "DARK" : "LIGHT"}
            properties={{
              // Apple Maps has no onPOIClick callback, so hide POIs entirely
              // to let all taps fall through to onMapClick for pin placement.
              pointsOfInterest: { including: [] },
            }}
          />
        );
      } else if (Platform.OS === "android") {
        return (
          <GoogleMaps.View
            cameraPosition={cameraPosition}
            markers={markers}
            style={styles.map}
            onMapClick={(e: any) => handleMapClick(e.coordinates)}
            onPOIClick={(e: any) => handleMapClick(e.coordinates)}
            colorScheme={isDark ? "DARK" : "LIGHT"}
          />
        );
      }
    } catch (err) {
      console.warn("Failed to render native map component:", err);
      return (
        <View
          style={[
            styles.mapPlaceholder,
            { backgroundColor: colors.border + "30" },
          ]}
        >
          <Ionicons
            name="map-outline"
            size={24}
            color={colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.mapPlaceholderText,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Map rendering failed or unavailable.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.onSurface,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          value={searchText}
          onChangeText={handleTextChange}
          placeholder={placeholder || "Search or type address..."}
          placeholderTextColor={colors.onSurfaceVariant}
          autoCapitalize="sentences"
        />
        {loadingSuggestions && (
          <ActivityIndicator
            style={styles.spinner}
            size="small"
            color={colors.primary}
          />
        )}
      </View>

      {/* Autocomplete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {suggestions.map((item) => (
            <Pressable
              key={item.place_id}
              style={({ pressed }) => [
                styles.suggestionItem,
                pressed && { backgroundColor: colors.border + "30" },
                { borderBottomColor: colors.border + "50" },
              ]}
              onPress={() =>
                handleSelectSuggestion(item.place_id, item.description)
              }
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[styles.suggestionText, { color: colors.onSurface }]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Interactive Map Preview */}
      {apiKey && (AppleMaps || GoogleMaps) ? (
        <View
          style={[styles.mapContainer, { borderColor: colors.border }]}
          onTouchStart={() => onMapInteraction?.(true)}
          onTouchEnd={() => onMapInteraction?.(false)}
          onTouchCancel={() => onMapInteraction?.(false)}
        >
          {renderMap()}
          <View
            style={[
              styles.mapBadge,
              { backgroundColor: colors.surface + "E0" },
            ]}
          >
            <Text style={[styles.mapBadgeText, { color: colors.onSurface }]}>
              {coords
                ? "Tap map to adjust pin location"
                : "Tap map to drop a pin"}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontFamily: "Inter_400Regular",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 15,
    flex: 1,
  },
  spinner: {
    position: "absolute",
    right: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    flex: 1,
  },
  mapContainer: {
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mapPlaceholderText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
