import { StyleSheet } from "react-native";
import { Color } from "expo-router";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: Color.android.dynamic.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: Color.android.dynamic.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Color.android.dynamic.onBackground,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 54,
    backgroundColor: Color.android.dynamic.surface,
    borderWidth: 1,
    borderColor: Color.android.dynamic.outline,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Color.android.dynamic.onSurface,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Color.android.dynamic.outline,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Color.android.dynamic.primary,
    borderColor: Color.android.dynamic.primary,
  },
  checkmark: {
    color: Color.android.dynamic.onPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: Color.android.dynamic.onBackground,
  },
  button: {
    height: 54,
    backgroundColor: Color.android.dynamic.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Color.android.dynamic.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});