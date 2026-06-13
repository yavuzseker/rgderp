import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { FAB, List, IconButton, Text } from "react-native-paper";
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
    } else {
      Alert.alert("Sil", `"${s.name}" silinsin mi?`, [
        { text: "İptal" },
        { text: "Sil", style: "destructive", onPress: () => deleteSupplier(s.id!) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {suppliers.length === 0 ? (
        <Text style={styles.empty}>Henüz tedarikçi yok.</Text>
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.contact}
              right={() => (
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/supplier-form",
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
              left={() => <List.Icon icon="truck-outline" />}
              style={styles.item}
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/admin/supplier-form")}
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
