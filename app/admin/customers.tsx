import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, List, IconButton, Text, Surface } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeCustomers, deleteCustomer } from "../../src/services/customers";
import type { Customer } from "../../src/types";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => subscribeCustomers(setCustomers), []);

  const handleDelete = (c: Customer) => {
    if (typeof window !== "undefined") {
      if (window.confirm(`"${c.name}" silinsin mi?`)) {
        deleteCustomer(c.id!);
      }
    }
  };

  return (
    <View style={styles.container}>
      {customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz müşteri eklenmedi
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            Sipariş oluşturmak için önce müşteri ekleyin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Surface style={styles.item} elevation={1}>
              <List.Item
                title={item.name}
                description={item.contact || "İletişim bilgisi yok"}
                right={() => (
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil-outline"
                      size={20}
                      onPress={() =>
                        router.push({
                          pathname: "/admin/customer-form",
                          params: { id: item.id },
                        })
                      }
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      iconColor="#E53935"
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                )}
                left={() => <List.Icon icon="account-outline" color="#4CAF50" />}
              />
            </Surface>
          )}
        />
      )}
      <FAB
        icon="plus"
        label="Yeni Müşteri"
        style={styles.fab}
        onPress={() => router.push("/admin/customer-form")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  list: { padding: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { color: "#555", marginBottom: 8 },
  emptyDesc: { color: "#999", textAlign: "center" },
  item: { marginBottom: 8, borderRadius: 10, overflow: "hidden" },
  actions: { flexDirection: "row", alignItems: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#1565C0",
  },
});
