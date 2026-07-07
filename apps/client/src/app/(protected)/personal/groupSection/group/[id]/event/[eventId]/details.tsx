import EventDetailsTab from "@/components/eventWorkspace/EventDetailsTab";
import EventPreferencesTab from "@/components/eventWorkspace/EventPreferencesTab";
import EventProposalsTab from "@/components/eventWorkspace/EventProposalsTab";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabType = "details" | "proposals" | "preferences";

export default function EventDetailsScreen() {
  const { id, eventId } = useLocalSearchParams<{
    id: string;
    eventId: string;
  }>();

  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const tabs: { key: TabType; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "proposals", label: "Proposals" },
    { key: "preferences", label: "Preferences" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Segmented Control Container */}
      <View
        style={[
          styles.segmentedControlContainer,
          { backgroundColor: colors.surfaceVariant },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: colors.surface,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.onSurfaceVariant,
                    fontFamily: isActive
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conditionally Render Content */}
      <View style={styles.contentContainer}>
        {activeTab === "details" && (
          <EventDetailsTab groupId={id!} eventId={eventId!} colors={colors} />
        )}
        {activeTab === "proposals" && (
          <EventProposalsTab groupId={id!} eventId={eventId!} colors={colors} />
        )}
        {activeTab === "preferences" && (
          <EventPreferencesTab
            groupId={id!}
            eventId={eventId!}
            colors={colors}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedControlContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabLabel: {
    fontSize: 13,
  },
  contentContainer: {
    flex: 1,
  },
});
