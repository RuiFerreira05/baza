import { useAppTheme } from "@/hooks/useAppTheme";
import { Tabs } from "expo-router";

export default function GroupListLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        headerShown: false,
        animation: "fade",
        tabBarPosition: "top",
        tabBarIconStyle: {
          display: "none",
        },
        tabBarStyle: {
          elevation: 0,
        },
        tabBarItemStyle: {
          borderTopColor: colors.border,
          paddingTop: 10,
          borderBottomWidth: navigation.isFocused() ? 2 : 0,
          borderBottomColor: colors.primary,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      })}
    >
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
        }}
      />
      <Tabs.Screen
        name="invites"
        options={{
          title: "Invites",
        }}
      />
    </Tabs>
  );
}
