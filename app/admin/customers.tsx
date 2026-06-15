import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { FAB, IconButton, Text, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { subscribeCustomers, deleteCustomer } from "../../src/services/customers";
import type { Customer } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { MotionView } from "../../src/components/MotionView";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => subscribeCustomers(setCustomers), []);

  const handleDelete = (c: Customer) => {
    if (typeof window !== "undefined" && window.confirm(`"${c.name}" silinsin mi?`)) {
      deleteCustomer(c.id!);
    }
  };

  return (
    <View style={styles.container}>
      {customers.length === 0 ? (
        <MotionView style={styles.empty}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={64}
            color={colors.border}
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Henüz müşteri yok
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDesc}>
            Sipariş oluşturmak için müşteri ekleyin.
          </Text>
        </MotionView>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotionView delay={index * 60}>
              <View style={styles.card}>
                <Avatar.Icon
                  size={46}
                  icon="account-outline"
                  color="#fff"
                  style={{ backgroundColor: colors.customer }}
                />
                <View style={styles.cardBody}>
                  <Text variant="titleMedium" style={styles.name}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.contact}>
                    {item.contact || "İletişim bilgisi yok"}
                  </Text>
                </View>
                <IconButton
                  icon="pencil-outline"
                  size={20}
                  iconColor={colors.textSecondary}
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
        label="Yeni Müşteri"
        color="#fff"
        style={styles.fab}
        onPress={() => router.push("/admin/customer-form")}
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
  contact: { color: colors.textSecondary, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
});
