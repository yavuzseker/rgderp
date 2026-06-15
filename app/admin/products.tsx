import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, List, IconButton, Text, Surface } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeProducts, deleteProduct } from "../../src/services/products";
import type { Product } from "../../src/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => subscribeProducts(setProducts), []);

  const handleDelete = (p: Product) => {
    if (typeof window !== "undefined") {
      if (window.confirm(`"${p.name}" silinsin mi?`)) {
        deleteProduct(p.id!);
      }
    }
  };

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz ürün eklenmedi
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            Aşağıdaki butona tıklayarak ilk ürününüzü tanımlayın.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Surface style={styles.item} elevation={1}>
              <List.Item
                title={item.name}
                description={`${item.code} · ${item.stages.length} aşama`}
                right={() => (
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil-outline"
                      size={20}
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
                      iconColor="#E53935"
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                )}
                left={() => <List.Icon icon="cube-outline" color="#1565C0" />}
              />
            </Surface>
          )}
        />
      )}
      <FAB
        icon="plus"
        label="Yeni Ürün"
        style={styles.fab}
        onPress={() => router.push("/admin/product-form")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { color: "#555", marginBottom: 8 },
  emptyDesc: { color: "#999", textAlign: "center" },
  item: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  actions: { flexDirection: "row", alignItems: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#1565C0",
  },
});
