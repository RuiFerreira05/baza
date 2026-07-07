import { useEventPreferencesStyles } from "@/constants/styles/useEventPreferencesStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";

interface MyPreferencesFormProps {
  myPreference: any;
  eventDetails: any;
  onSubmit: (preference: any, isPrivate: boolean) => Promise<any>;
  isSubmitting: boolean;
}
export default function MyPreferencesForm({
  myPreference,
  eventDetails,
  onSubmit,
  isSubmitting,
}: MyPreferencesFormProps) {
  const { colors } = useAppTheme();
  const styles = useEventPreferencesStyles();

  // Form states
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [activityInput, setActivityInput] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [duration, setDuration] = useState<string[]>([]);
  const [insideOutdoors, setInsideOutdoors] = useState<string>("both");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [negativePreferences, setNegativePreferences] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Parse event dates
  const eventDates = useMemo(() => {
    if (!eventDetails?.startDate || !eventDetails?.endDate) return [];
    const dates: string[] = [];
    const start = new Date(eventDetails.startDate);
    const end = new Date(eventDetails.endDate);
    const curr = new Date(start);
    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const d = String(curr.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [eventDetails]);

  const spansMultipleMonths = useMemo(() => {
    if (!eventDetails?.startDate || !eventDetails?.endDate) return false;
    const startParts = eventDetails.startDate.split("-");
    const endParts = eventDetails.endDate.split("-");
    return startParts[0] !== endParts[0] || startParts[1] !== endParts[1];
  }, [eventDetails]);

  // Hydrate form states when personal preference loads
  useEffect(() => {
    if (myPreference) {
      const p = myPreference.preference as any;
      setTimeout(() => {
        setIsPrivate(myPreference.private);
        if (p) {
          if (typeof p.numberOfPeople === "number")
            setNumberOfPeople(String(p.numberOfPeople));
          if (typeof p.minBudget === "number")
            setMinBudget(String(p.minBudget));
          if (typeof p.maxBudget === "number")
            setMaxBudget(String(p.maxBudget));
          if (Array.isArray(p.activities)) setActivities(p.activities);
          if (Array.isArray(p.timeOfDay)) setTimeOfDay(p.timeOfDay);
          if (Array.isArray(p.duration)) {
            setDuration(p.duration);
          } else if (typeof p.duration === "string" && p.duration) {
            setDuration([p.duration]);
          } else {
            setDuration([]);
          }
          if (typeof p.insideOutdoors === "string")
            setInsideOutdoors(p.insideOutdoors);
          if (Array.isArray(p.availableDates))
            setAvailableDates(p.availableDates);
          if (typeof p.negativePreferences === "string")
            setNegativePreferences(p.negativePreferences);
        }
      }, 0);
    }
  }, [myPreference]);

  const handleAddActivity = () => {
    const trimmed = activityInput.trim().toLowerCase();
    if (trimmed && !activities.includes(trimmed)) {
      setActivities([...activities, trimmed]);
      setActivityInput("");
    }
  };

  const handleRemoveActivity = (tag: string) => {
    setActivities(activities.filter((a) => a !== tag));
  };

  const isTimeOfDayNoPref = timeOfDay.length === 0;

  const toggleTimeOfDay = (time: string) => {
    if (time === "none") {
      setTimeOfDay([]);
      return;
    }
    if (timeOfDay.includes(time)) {
      setTimeOfDay(timeOfDay.filter((t) => t !== time));
    } else {
      setTimeOfDay([...timeOfDay, time]);
    }
  };

  const toggleAvailableDate = (date: string) => {
    if (availableDates.includes(date)) {
      setAvailableDates(availableDates.filter((d) => d !== date));
    } else {
      setAvailableDates([...availableDates, date]);
    }
  };

  const toggleDuration = (value: string) => {
    if (value === "none") {
      setDuration([]);
      return;
    }
    if (duration.includes(value)) {
      setDuration(duration.filter((d) => d !== value));
    } else {
      setDuration([...duration, value]);
    }
  };

  const calendarTheme = useMemo(() => {
    return {
      backgroundColor: colors.background,
      calendarBackground: colors.background,
      textSectionTitleColor: colors.onSurfaceVariant,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: colors.onPrimary,
      todayTextColor: colors.primary,
      dayTextColor: colors.onSurface,
      textDisabledColor: colors.disabled,
      dotColor: colors.primary,
      selectedDotColor: colors.onPrimary,
      disabledDotColor: colors.disabled,
      monthTextColor: colors.onSurface,
      indicatorColor: colors.primary,
      textMonthFontFamily: "Inter_600SemiBold",
      textDayFontFamily: "Inter_400Regular",
      textDayHeaderFontFamily: "Inter_500Medium",
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 12,
      arrowColor: colors.primary,
    };
  }, [colors]);

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    availableDates.forEach((d) => {
      marked[d] = {
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.onPrimary,
      };
    });
    return marked;
  }, [availableDates, colors]);

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    if (
      eventDetails?.startDate &&
      eventDetails?.endDate &&
      (dateStr < eventDetails.startDate || dateStr > eventDetails.endDate)
    ) {
      return;
    }
    toggleAvailableDate(dateStr);
  };

  const handleSubmit = async () => {
    const numPeople = numberOfPeople.trim()
      ? parseInt(numberOfPeople, 10)
      : undefined;
    const minB = minBudget.trim() ? parseInt(minBudget, 10) : undefined;
    const maxB = maxBudget.trim() ? parseInt(maxBudget, 10) : undefined;

    if (numPeople !== undefined && (isNaN(numPeople) || numPeople <= 0)) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2: "Number of people must be positive.",
      });
      return;
    }

    if (minB !== undefined && isNaN(minB)) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2: "Min budget must be a number.",
      });
      return;
    }

    if (maxB !== undefined && isNaN(maxB)) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2: "Max budget must be a number.",
      });
      return;
    }

    if (minB !== undefined && maxB !== undefined && minB >= maxB) {
      Toast.show({
        type: "error",
        text1: "Validation",
        text2: "Min budget must be less than max budget.",
      });
      return;
    }

    const payload = {
      numberOfPeople: numPeople,
      minBudget: minB,
      maxBudget: maxB,
      activities: activities.length > 0 ? activities : undefined,
      timeOfDay: timeOfDay.length > 0 ? timeOfDay : undefined,
      duration: duration.length > 0 ? duration : undefined,
      insideOutdoors: insideOutdoors || undefined,
      availableDates: availableDates.length > 0 ? availableDates : undefined,
      negativePreferences: negativePreferences.trim() || undefined,
    };

    await onSubmit(payload, isPrivate);
  };

  return (
    <View style={styles.card}>
      {/* Preferred Dates Calendar */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Which days work for you?
        </Text>
        {eventDetails?.startDate && eventDetails?.endDate ? (
          <View
            style={{
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Calendar
              minDate={eventDetails.startDate}
              maxDate={eventDetails.endDate}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={calendarTheme}
              hideArrows={!spansMultipleMonths}
              disableMonthChange={!spansMultipleMonths}
            />
          </View>
        ) : (
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
            No dates configured for this event.
          </Text>
        )}
        {eventDetails?.startDate && eventDetails?.endDate && (
          <Pressable
            onPress={() => {
              if (availableDates.length === eventDates.length) {
                setAvailableDates([]);
              } else {
                setAvailableDates([...eventDates]);
              }
            }}
            style={[
              styles.capsule,
              {
                marginTop: 8,
                alignSelf: "flex-start",
                backgroundColor:
                  availableDates.length === eventDates.length
                    ? colors.primary + "15"
                    : colors.surfaceVariant,
                borderColor:
                  availableDates.length === eventDates.length
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.capsuleText,
                {
                  color:
                    availableDates.length === eventDates.length
                      ? colors.primary
                      : colors.onSurface,
                },
              ]}
            >
              {availableDates.length === eventDates.length
                ? "Clear Selection"
                : "No Preference (Any Day Works)"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Number of People */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Estimated Group Size (Optional)
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 5"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          value={numberOfPeople}
          onChangeText={setNumberOfPeople}
        />
      </View>

      {/* Budgets */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Your Budget Range (Optional)
        </Text>
        <View style={styles.budgetRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Min (€)"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            value={minBudget}
            onChangeText={setMinBudget}
          />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Max (€)"
            placeholderTextColor={colors.placeholder}
            keyboardType="number-pad"
            value={maxBudget}
            onChangeText={setMaxBudget}
          />
        </View>
      </View>

      {/* Activities Tags */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          What do you feel like doing? (Optional)
        </Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="e.g. Sushi, Hiking, Gaming"
            placeholderTextColor={colors.placeholder}
            value={activityInput}
            onChangeText={setActivityInput}
            onSubmitEditing={handleAddActivity}
          />
          <Pressable
            style={[styles.addTagBtn, { backgroundColor: colors.primary }]}
            onPress={handleAddActivity}
          >
            <Ionicons name="add" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
        <View style={styles.tagsGrid}>
          {activities.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: colors.surfaceVariant }]}
            >
              <Text style={[styles.tagText, { color: colors.onSurface }]}>
                {tag}
              </Text>
              <Pressable onPress={() => handleRemoveActivity(tag)}>
                <Ionicons
                  name="close"
                  size={14}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Time of Day */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Time of Day Preference
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["morning", "afternoon"].map((t) => {
              const isSelected = timeOfDay.includes(t);
              return (
                <Pressable
                  key={t}
                  style={[
                    styles.capsule,
                    { flex: 1 },
                    isSelected && {
                      backgroundColor: colors.primary + "15",
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleTimeOfDay(t)}
                >
                  <Text
                    style={[
                      styles.capsuleText,
                      styles.capitalize,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["evening", "night"].map((t) => {
              const isSelected = timeOfDay.includes(t);
              return (
                <Pressable
                  key={t}
                  style={[
                    styles.capsule,
                    { flex: 1 },
                    isSelected && {
                      backgroundColor: colors.primary + "15",
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleTimeOfDay(t)}
                >
                  <Text
                    style={[
                      styles.capsuleText,
                      styles.capitalize,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={[
              styles.capsule,
              isTimeOfDayNoPref && {
                backgroundColor: colors.primary + "15",
                borderColor: colors.primary,
              },
            ]}
            onPress={() => toggleTimeOfDay("none")}
          >
            <Text
              style={[
                styles.capsuleText,
                {
                  color: isTimeOfDayNoPref ? colors.primary : colors.onSurface,
                  textAlign: "center",
                },
              ]}
            >
              No preference
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Duration */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Preferred Duration
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "short", label: "Short (< 2h)" },
              { key: "medium", label: "Medium (2-4h)" },
            ].map((item) => {
              const isSelected = duration.includes(item.key);
              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.capsule,
                    { flex: 1 },
                    isSelected && {
                      backgroundColor: colors.primary + "15",
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleDuration(item.key)}
                >
                  <Text
                    style={[
                      styles.capsuleText,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "long", label: "Long (All-Day)" },
              { key: "none", label: "No preference" },
            ].map((item) => {
              const isSelected =
                item.key === "none"
                  ? duration.length === 0
                  : duration.includes(item.key);
              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.capsule,
                    { flex: 1 },
                    isSelected && {
                      backgroundColor: colors.primary + "15",
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleDuration(item.key)}
                >
                  <Text
                    style={[
                      styles.capsuleText,
                      {
                        color: isSelected ? colors.primary : colors.onSurface,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Inside/Outdoors */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Environment Preference
        </Text>
        <View style={styles.multiSelectRow}>
          {[
            { key: "inside", label: "Indoor" },
            { key: "outdoors", label: "Outdoor" },
            { key: "both", label: "No preference" },
          ].map((item) => {
            const isSelected = insideOutdoors === item.key;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.capsule,
                  { flex: 1 },
                  isSelected && {
                    backgroundColor: colors.primary + "15",
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setInsideOutdoors(item.key)}
              >
                <Text
                  style={[
                    styles.capsuleText,
                    {
                      color: isSelected ? colors.primary : colors.onSurface,
                      textAlign: "center",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Negative Preferences (Dislikes) */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          Things to Avoid / Dislikes
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. No seafood, Avoid high-energy activities..."
          placeholderTextColor={colors.placeholder}
          multiline={true}
          value={negativePreferences}
          onChangeText={setNegativePreferences}
        />
      </View>

      {/* Keep Preferences Private Switch */}
      <View style={styles.switchRow}>
        <View style={styles.switchLabelContainer}>
          <Text style={[styles.switchLabel, { color: colors.onSurface }]}>
            Keep Preference Private
          </Text>
          <Text style={[styles.switchSub, { color: colors.onSurfaceVariant }]}>
            Only count towards group total, don&apos;t show individual details
            to others.
          </Text>
        </View>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={Platform.OS === "android" ? colors.surface : undefined}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={
          isSubmitting ||
          eventDetails?.state === "finished" ||
          eventDetails?.state === "needs_tiebreaker"
        }
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <Text style={[styles.submitBtnText, { color: colors.onPrimary }]}>
            Save Preferences
          </Text>
        )}
      </Pressable>
    </View>
  );
}
