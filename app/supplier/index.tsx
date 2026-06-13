import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function SupplierHome() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Tedarikçi Paneli</Text>
      <Text variant="bodyMedium" style={styles.hint}>
        Faz 2'de aktif edilecek. Token ile giriş yaparak atanmış aşamalarınızı
        görebileceksiniz.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  hint: { marginTop: 12, color: "#666", textAlign: "center" },
});
