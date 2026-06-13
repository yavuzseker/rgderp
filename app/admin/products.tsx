import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { FAB, List, IconButton, Text, Chip } from "react-native-paper";
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
    } else {
      Alert.alert("Sil", `"${p.name}" silinsin mi?`, [
        { text: "İptal" },
        { text: "Sil", style: "destructive", onPress: () => deleteProduct(p.id!) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <Text style={styles.empty}>Henüz ürün yok. + ile ekleyin.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <List.Item
              title={`${item.name} (${item.code})`}
              description={`${item.stages.length} aşama`}
              right={() => (
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/product-form",
                        params: { id: item.id },
                      })
                    }
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(item)}
                  />
                </View>
              )}
              left={() => <List.Icon icon="cube-outline" />}
              style={styles.item}
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/admin/product-form")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
  item: { backgroundColor: "#fff", marginHorizontal: 12, marginTop: 8, borderRadius: 8 },
  actions: { flexDirection: "row", alignItems: "center" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
