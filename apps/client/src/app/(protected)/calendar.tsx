import { useGlobalStyles } from "@/constants/styles/global";
import { useCalendarViewModel } from "@/viewmodels/useCalendarViewModel";
import { Button, Text, View } from "react-native";
import Toast from "react-native-toast-message";

// This pattern of letting the viewmodel handle page routing is probs only gonna be used for links
// inside pages because the tabs will be handling routing themselves.
// I've included a small example of this pattern here for demonstration purposes.
export default function CalendarScreen() {
  const styles = useGlobalStyles();
  const vm = useCalendarViewModel();

  const showToast = () => {
    Toast.show({
      text1: "Hello",
      text2: "This is a toast message from the Calendar screen.",
      type: "info",
      position: "bottom",
      bottomOffset: 80,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Calendar Screen</Text>
      <Text style={{ marginVertical: 20 }}>
        Current date: {vm.selectedDate.toDateString()}
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <Button title="Previous Day" onPress={() => vm.changeDay(-1)} />
        <View style={{ width: 20 }} />
        <Button title="Next Day" onPress={() => vm.changeDay(1)} />
      </View>

      <Button title="Show Toast" onPress={showToast} />

      <Button title="Go to Groups" onPress={vm.navigateToGroups} />

      <Button title="Go to Profile" onPress={vm.navigateToProfile} />

      <Button title="Sign Out" onPress={vm.signOut} />
    </View>
  );
}

