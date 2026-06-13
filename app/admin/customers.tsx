import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { FAB, List, IconButton, Text } from "react-native-paper";
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
    } else {
      Alert.alert("Sil", `"${c.name}" silinsin mi?`, [
        { text: "İptal" },
        { text: "Sil", style: "destructive", onPress: () => deleteCustomer(c.id!) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {customers.length === 0 ? (
        <Text style={styles.empty}>Henüz müşteri yok.</Text>
      ) : (
        <FlatList
          data={customers}
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
                        pathname: "/admin/customer-form",
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
              left={() => <List.Icon icon="account-outline" />}
              style={styles.item}
            />
          )}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/admin/customer-form")}
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
