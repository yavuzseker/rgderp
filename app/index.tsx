import { View, StyleSheet } from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          RGD-ERP
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Üretim Takip Sistemi
        </Text>
        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={() => router.push("/admin")}
            style={styles.button}
          >
            Admin Paneli
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/supplier")}
            style={styles.button}
          >
            Tedarikçi Girişi
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/customer")}
            style={styles.button}
          >
            Müşteri Takip
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  title: { fontWeight: "bold", color: "#1565C0" },
  subtitle: { marginTop: 4, marginBottom: 24, color: "#666" },
  buttons: { width: "100%", gap: 12 },
  button: { width: "100%" },
});
