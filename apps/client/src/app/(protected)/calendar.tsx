import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarScreen() {
  const styles = useGlobalStyles();
  // const vm = useCalendarViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar Screen</Text>
      <Calendar onDayPress={(day) => console.log(day)}></Calendar>
    </View>
  );
}
