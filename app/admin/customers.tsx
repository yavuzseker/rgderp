import { useEffect, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeCustomers, deleteCustomer } from "../../src/services/customers";
import type { Customer } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { DataTableView, Column } from "../../src/components/DataTableView";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => subscribeCustomers(setCustomers), []);

  const handleDelete = (c: Customer) => {
    if (typeof window !== "undefined" && window.confirm(`"${c.name}" silinsin mi?`)) {
      deleteCustomer(c.id!);
    }
  };

  const edit = (c: Customer) =>
    router.push({ pathname: "/admin/customer-form", params: { id: c.id } });

  const columns: Column<Customer>[] = [
    {
      key: "name",
      title: "Müşteri Adı",
      flex: 2.2,
      sortValue: (c) => c.name.toLocaleLowerCase("tr"),
      render: (c) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar.Icon
            size={34}
            icon="account-outline"
            color="#fff"
            style={{ backgroundColor: colors.customer }}
          />
          <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
            {c.name}
          </Text>
        </View>
      ),
    },
    {
      key: "contact",
      title: "İletişim",
      flex: 2,
      sortValue: (c) => c.contact ?? "",
      render: (c) => (
        <Text style={{ color: colors.textSecondary }}>{c.contact || "—"}</Text>
      ),
    },
    {
      key: "token",
      title: "Token",
      flex: 1.6,
      render: (c) => (
        <Text
          numberOfLines={1}
          style={{ color: colors.textMuted, fontFamily: "monospace", fontSize: 12 }}
        >
          {c.accessToken?.slice(0, 10)}…
        </Text>
      ),
    },
    {
      key: "actions",
      title: "İşlemler",
      flex: 1,
      numeric: true,
      render: (c) => (
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <IconButton
            icon="pencil-outline"
            size={20}
            iconColor={colors.textSecondary}
            onPress={() => edit(c)}
          />
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={colors.danger}
            onPress={() => handleDelete(c)}
          />
        </View>
      ),
    },
  ];

  return (
    <DataTableView
      data={customers}
      columns={columns}
      rowKey={(c) => c.id!}
      onRowPress={edit}
      searchText={(c) => `${c.name} ${c.contact}`}
      searchPlaceholder="Müşteri ara..."
      addLabel="Yeni Müşteri"
      onAdd={() => router.push("/admin/customer-form")}
      emptyIcon="account-group-outline"
      emptyText="Henüz müşteri yok"
      emptyHint="Sipariş oluşturmak için müşteri ekleyin."
    />
  );
}
