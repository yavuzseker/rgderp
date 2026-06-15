import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, IconButton, Text, Avatar, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { subscribeProducts, deleteProduct } from "../../src/services/products";
import type { Product } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { MotionView } from "../../src/components/MotionView";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => subscribeProducts(setProducts), []);

  const handleDelete = (p: Product) => {
    if (typeof window !== "undefined" && window.confirm(`"${p.name}" silinsin mi?`)) {
      deleteProduct(p.id!);
    }
  };

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <MotionView style={styles.empty}>
          <MaterialCommunityIcons
            name="cube-outline"
            size={64}
            color={colors.border}
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz ürün yok
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            İlk ürününüzü ve üretim rotasını tanımlayın.
          </Text>
        </MotionView>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotionView delay={index * 60}>
              <View style={styles.card}>
                <Avatar.Icon
                  size={46}
                  icon="cube-outline"
                  color="#fff"
                  style={{ backgroundColor: colors.product }}
                />
                <View style={styles.cardBody}>
                  <Text variant="titleMedium" style={styles.name}>
                    {item.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <Chip
                      compact
                      style={styles.codeChip}
                      textStyle={styles.codeChipText}
                    >
                      {item.code}
                    </Chip>
                    <Text variant="bodySmall" style={styles.stageText}>
                      {item.stages.length} aşama
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="pencil-outline"
                  size={20}
                  iconColor={colors.textSecondary}
                  onPress={() =>
                    router.push({
                      pathname: "/admin/product-form",
                      params: { id: item.id },
                    })
                  }
                />
                <IconButton
                  icon="trash-can-outline"
                  size={20}
                  iconColor={colors.danger}
                  onPress={() => handleDelete(item)}
                />
              </View>
            </MotionView>
          )}
        />
      )}
      <FAB
        icon="plus"
        label="Yeni Ürün"
        color="#fff"
        style={styles.fab}
        onPress={() => router.push("/admin/product-form")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 96, maxWidth: 720, width: "100%", alignSelf: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: { color: colors.textSecondary, marginTop: 16, fontWeight: "700" },
  emptyDesc: { color: colors.textMuted, textAlign: "center", marginTop: 6 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardBody: { flex: 1, marginLeft: 12 },
  name: { fontWeight: "700", color: colors.textPrimary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  codeChip: { backgroundColor: "#EEF2FF", height: 26 },
  codeChipText: { color: colors.product, fontSize: 11, fontWeight: "600", lineHeight: 14 },
  stageText: { color: colors.textSecondary },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
