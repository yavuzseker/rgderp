import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors, gradients } from "../src/theme/colors";
import { MotionView } from "../src/components/MotionView";
import { PressableScale } from "../src/components/PressableScale";

const roles = [
  {
    title: "Admin Paneli",
    desc: "Ürün, tedarikçi ve sipariş yönetimi",
    icon: "shield-account",
    route: "/admin",
    grad: gradients.primary,
  },
  {
    title: "Tedarikçi Girişi",
    desc: "Atanmış üretim aşamalarını gör",
    icon: "truck-fast",
    route: "/supplier",
    grad: gradients.supplier,
  },
  {
    title: "Müşteri Takip",
    desc: "Sipariş ilerlemeni izle",
    icon: "package-variant-closed",
    route: "/customer",
    grad: gradients.customer,
  },
] as const;

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <MotionView offsetY={24}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="factory" size={40} color="#fff" />
          </View>
          <Text variant="headlineMedium" style={styles.brand}>
            RGD-ERP
          </Text>
          <Text variant="bodyLarge" style={styles.tagline}>
            Üretim Takip Sistemi
          </Text>
        </MotionView>
      </LinearGradient>

      <View style={styles.body}>
        {roles.map((r, i) => (
          <MotionView key={r.route} delay={120 + i * 90}>
            <PressableScale
              style={styles.card}
              onPress={() => router.push(r.route)}
            >
              <LinearGradient
                colors={r.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIcon}
              >
                <MaterialCommunityIcons
                  name={r.icon}
                  size={26}
                  color="#fff"
                />
              </LinearGradient>
              <View style={styles.cardText}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {r.title}
                </Text>
                <Text variant="bodySmall" style={styles.cardDesc}>
                  {r.desc}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textMuted}
              />
            </PressableScale>
          </MotionView>
        ))}
      </View>

      <Text variant="bodySmall" style={styles.footer}>
        RGD Üretim · MRP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  brand: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 4,
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 14,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: { flex: 1 },
  cardTitle: { fontWeight: "700", color: colors.textPrimary },
  cardDesc: { color: colors.textSecondary, marginTop: 2 },
  footer: {
    textAlign: "center",
    color: colors.textMuted,
    paddingBottom: 20,
  },
});
