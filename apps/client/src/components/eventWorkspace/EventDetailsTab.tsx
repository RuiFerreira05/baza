import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EventTabProps {
  groupId: string;
  eventId: string;
  colors: any;
}

export default function EventDetailsTab({
  groupId,
  eventId,
  colors,
}: EventTabProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.onBackground }]}>
        Event Details Screen
      </Text>
      <Text style={[styles.subtext, { color: colors.onSurfaceVariant }]}>
        Group ID: {groupId}
      </Text>
      <Text style={[styles.subtext, { color: colors.onSurfaceVariant }]}>
        Event ID: {eventId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
});
