import { useAppTheme } from "@/hooks/useAppTheme";
import { Tabs } from "expo-router";

export default function FriendListLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="friends"
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
        name="friends"
        options={{
          title: "friends",
        }}
      />
    </Tabs>
  );
}
