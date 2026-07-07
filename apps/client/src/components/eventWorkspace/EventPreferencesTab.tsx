import { useEventPreferencesStyles } from "@/constants/styles/useEventPreferencesStyles";
import { useEventWorkspaceViewModel } from "@/viewmodels/useEventWorkspaceViewModel";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import GroupPreferencesDashboard from "./GroupPreferencesDashboard";
import MyPreferencesForm from "./MyPreferencesForm";

interface EventTabProps {
  groupId: string;
  eventId: string;
  colors: any;
}

export default function EventPreferencesTab({
  groupId,
  eventId,
  colors,
}: EventTabProps) {
  const vm = useEventWorkspaceViewModel(groupId, eventId);
  const styles = useEventPreferencesStyles();

  // View state: "form" or "group"
  const [subMode, setSubMode] = useState<"form" | "group">("form");

  if (vm.isPreferencesLoading && !vm.myPreference) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sub Mode Toggle Capsules */}
      <View style={styles.subModeToggleRow}>
        <Pressable
          style={[
            styles.toggleBtn,
            subMode === "form" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSubMode("form")}
        >
          <Text
            style={[
              styles.toggleBtnText,
              {
                color:
                  subMode === "form"
                    ? colors.onPrimary
                    : colors.onSurfaceVariant,
              },
            ]}
          >
            My Preferences
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleBtn,
            subMode === "group" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSubMode("group")}
        >
          <Text
            style={[
              styles.toggleBtnText,
              {
                color:
                  subMode === "group"
                    ? colors.onPrimary
                    : colors.onSurfaceVariant,
              },
            ]}
          >
            Group View
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {subMode === "form" ? (
          <MyPreferencesForm
            myPreference={vm.myPreference}
            eventDetails={vm.eventDetails}
            onSubmit={(preference, isPrivate) =>
              vm.submitPreference({ preference, private: isPrivate })
            }
            isSubmitting={vm.isSubmittingPreference}
          />
        ) : (
          <GroupPreferencesDashboard
            groupPreferenceReport={vm.groupPreferenceReport}
            allPreferences={vm.allPreferences}
          />
        )}
      </ScrollView>
    </View>
  );
}
