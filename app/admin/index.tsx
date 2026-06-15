import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors, gradients } from "../../src/theme/colors";
import { MotionView } from "../../src/components/MotionView";
import { PressableScale } from "../../src/components/PressableScale";

const modules = [
  {
    title: "Ürünler",
    desc: "Ürün & üretim rotaları",
    icon: "cube-outline",
    route: "/admin/products",
    grad: gradients.product,
  },
  {
    title: "Tedarikçiler",
    desc: "Dış firma / atölye",
    icon: "truck-outline",
    route: "/admin/suppliers",
    grad: gradients.supplier,
  },
  {
    title: "Müşteriler",
    desc: "Müşteri kayıtları",
    icon: "account-group-outline",
    route: "/admin/customers",
    grad: gradients.customer,
  },
  {
    title: "Siparişler",
    desc: "Sipariş & üretim takibi",
    icon: "clipboard-list-outline",
    route: "/admin/orders",
    grad: gradients.order,
  },
] as const;

export default function AdminHome() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <MotionView offsetY={20}>
        <Text variant="headlineSmall" style={styles.heading}>
          Yönetim Paneli
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bir modül seçerek başlayın
        </Text>
      </MotionView>

      <View style={styles.grid}>
        {modules.map((m, i) => (
          <MotionView
            key={m.route}
            delay={100 + i * 80}
            style={styles.gridItem}
          >
            <PressableScale
              style={styles.card}
              onPress={() => router.push(m.route)}
            >
              <LinearGradient
                colors={m.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconBox}
              >
                <MaterialCommunityIcons name={m.icon} size={28} color="#fff" />
              </LinearGradient>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {m.title}
              </Text>
              <Text variant="bodySmall" style={styles.cardDesc}>
                {m.desc}
              </Text>
            </PressableScale>
          </MotionView>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, maxWidth: 720, width: "100%", alignSelf: "center" },
  heading: { fontWeight: "800", color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 150,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    minHeight: 150,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: { fontWeight: "700", color: colors.textPrimary },
  cardDesc: { color: colors.textSecondary, marginTop: 2 },
});
