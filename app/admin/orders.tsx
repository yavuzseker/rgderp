import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, List, Text, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeOrders } from "../../src/services/orders";
import type { Order } from "../../src/types";

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "Üretimde",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  open: "#2196F3",
  in_progress: "#FF9800",
  completed: "#4CAF50",
  cancelled: "#F44336",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => subscribeOrders(setOrders), []);

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.empty}>Henüz sipariş yok.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <List.Item
              title={`${item.orderNo} — ${item.productName}`}
              description={`${item.customerName} · ${item.totalQty} adet`}
              right={() => (
                <Chip
                  compact
                  style={{
                    backgroundColor: statusColors[item.status] + "20",
                    alignSelf: "center",
                  }}
                  textStyle={{ color: statusColors[item.status], fontSize: 12 }}
                >
                  {statusLabels[item.status]}
                </Chip>
              )}
              left={() => <List.Icon icon="clipboard-list-outline" />}
              style={styles.item}
              onPress={() =>
                router.push({
                  pathname: "/admin/order-detail",
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/admin/order-form")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
  item: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
