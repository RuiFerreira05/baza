import { authClient } from "@/lib/auth";
import { styles } from "@/styles/styles";
import { Text } from "@react-navigation/elements";
import { TouchableOpacity, useColorScheme, View } from "react-native";

export default function Me() {
  useColorScheme();

  const { data: session } = authClient.useSession();

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Hi there {session?.user.name}!</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Your email is {session?.user.email}</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => authClient.signOut()}>
          <Text style={styles.buttonText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
