import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, List, IconButton, Text, Surface } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeSuppliers, deleteSupplier } from "../../src/services/suppliers";
import type { Supplier } from "../../src/types";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const router = useRouter();

  useEffect(() => subscribeSuppliers(setSuppliers), []);

  const handleDelete = (s: Supplier) => {
    if (typeof window !== "undefined") {
      if (window.confirm(`"${s.name}" silinsin mi?`)) {
        deleteSupplier(s.id!);
      }
    }
  };

  return (
    <View style={styles.container}>
      {suppliers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz tedarikçi eklenmedi
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            Ürün rotalarında kullanmak için önce tedarikçi ekleyin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={suppliers}
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
                          pathname: "/admin/supplier-form",
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
                left={() => <List.Icon icon="truck-outline" color="#FF9800" />}
              />
            </Surface>
          )}
        />
      )}
      <FAB
        icon="plus"
        label="Yeni Tedarikçi"
        style={styles.fab}
        onPress={() => router.push("/admin/supplier-form")}
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
