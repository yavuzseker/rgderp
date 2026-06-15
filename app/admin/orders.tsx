import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, Text, Chip, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { subscribeOrders } from "../../src/services/orders";
import type { Order } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { MotionView } from "../../src/components/MotionView";
import { PressableScale } from "../../src/components/PressableScale";

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "Üretimde",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  open: colors.open,
  in_progress: colors.inProgress,
  completed: colors.completed,
  cancelled: colors.cancelled,
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => subscribeOrders(setOrders), []);

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <MotionView style={styles.empty}>
          <MaterialCommunityIcons
            name="clipboard-list-outline"
            size={64}
            color={colors.border}
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz sipariş yok
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            Yeni sipariş açmak için aşağıdaki butonu kullanın.
          </Text>
        </MotionView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotionView delay={index * 60}>
              <PressableScale
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/admin/order-detail",
                    params: { id: item.id },
                  })
                }
              >
                <Avatar.Icon
                  size={46}
                  icon="clipboard-text-outline"
                  color="#fff"
                  style={{ backgroundColor: colors.order }}
                />
                <View style={styles.cardBody}>
                  <Text variant="titleMedium" style={styles.orderNo}>
                    {item.orderNo}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {item.productName} · {item.customerName}
                  </Text>
                  <Text variant="bodySmall" style={styles.qty}>
                    {item.totalQty} adet
                  </Text>
                </View>
                <Chip
                  compact
                  style={{ backgroundColor: statusColors[item.status] + "1A" }}
                  textStyle={{
                    color: statusColors[item.status],
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {statusLabels[item.status]}
                </Chip>
              </PressableScale>
            </MotionView>
          )}
        />
      )}
      <FAB
        icon="plus"
        label="Yeni Sipariş"
        color="#fff"
        style={styles.fab}
        onPress={() => router.push("/admin/order-form")}
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
  orderNo: { fontWeight: "700", color: colors.textPrimary },
  meta: { color: colors.textSecondary, marginTop: 2 },
  qty: { color: colors.textMuted, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
