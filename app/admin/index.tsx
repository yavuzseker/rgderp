import { View, StyleSheet } from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { useRouter } from "expo-router";

export default function AdminHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Yönetim
      </Text>
      <View style={styles.grid}>
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">Ürünler & Rotalar</Text>
          <Text variant="bodySmall" style={styles.desc}>
            Ürün tanımla, üretim aşamalarını belirle
          </Text>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/admin/products")}
            style={styles.btn}
          >
            Ürünler
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">Tedarikçiler</Text>
          <Text variant="bodySmall" style={styles.desc}>
            Dış firma / atölye tanımla
          </Text>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/admin/suppliers")}
            style={styles.btn}
          >
            Tedarikçiler
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">Müşteriler</Text>
          <Text variant="bodySmall" style={styles.desc}>
            Müşteri tanımla
          </Text>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/admin/customers")}
            style={styles.btn}
          >
            Müşteriler
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium">Siparişler</Text>
          <Text variant="bodySmall" style={styles.desc}>
            Sipariş aç, üretim takip et
          </Text>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/admin/orders")}
            style={styles.btn}
          >
            Siparişler
          </Button>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  heading: { marginBottom: 16, fontWeight: "bold" },
  grid: { gap: 12 },
  card: { padding: 16, borderRadius: 8 },
  desc: { color: "#666", marginTop: 4, marginBottom: 12 },
  btn: { alignSelf: "flex-start" },
});
