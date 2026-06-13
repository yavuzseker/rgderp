import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function CustomerHome() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Müşteri Takip</Text>
      <Text variant="bodyMedium" style={styles.hint}>
        Faz 3'te aktif edilecek. Token ile giriş yaparak siparişlerinizin
        durumunu takip edebileceksiniz.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  hint: { marginTop: 12, color: "#666", textAlign: "center" },
});
