import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export type ErrorBoundaryProps = {
  error: Error;
  retry: () => Promise<void>;
};

export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.subtitle}>
        We encountered an unexpected error. The development team has been
        notified.
      </Text>

      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {error?.name || "Error"}: {error?.message || "Unknown error occurred"}
        </Text>
      </View>

      <Button title="Try Again" onPress={retry} color="#007AFF" />
    </View>
  );
}

// Later create a separate file for this using the app theme and import it here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE3E3",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    marginBottom: 24,
  },
  errorText: {
    fontFamily: "System",
    color: "#E03131",
    fontSize: 13,
  },
});
