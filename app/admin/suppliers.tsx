import { useEffect, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeSuppliers, deleteSupplier } from "../../src/services/suppliers";
import type { Supplier } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { DataTableView, Column } from "../../src/components/DataTableView";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const router = useRouter();

  useEffect(() => subscribeSuppliers(setSuppliers), []);

  const handleDelete = (s: Supplier) => {
    if (typeof window !== "undefined" && window.confirm(`"${s.name}" silinsin mi?`)) {
      deleteSupplier(s.id!);
    }
  };

  const edit = (s: Supplier) =>
    router.push({ pathname: "/admin/supplier-form", params: { id: s.id } });

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      title: "Firma Adı",
      flex: 2.2,
      sortValue: (s) => s.name.toLocaleLowerCase("tr"),
      render: (s) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar.Icon
            size={34}
            icon="truck-outline"
            color="#fff"
            style={{ backgroundColor: colors.supplier }}
          />
          <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
            {s.name}
          </Text>
        </View>
      ),
    },
    {
      key: "contact",
      title: "İletişim",
      flex: 2,
      sortValue: (s) => s.contact ?? "",
      render: (s) => (
        <Text style={{ color: colors.textSecondary }}>
          {s.contact || "—"}
        </Text>
      ),
    },
    {
      key: "token",
      title: "Token",
      flex: 1.6,
      render: (s) => (
        <Text
          numberOfLines={1}
          style={{ color: colors.textMuted, fontFamily: "monospace", fontSize: 12 }}
        >
          {s.accessToken?.slice(0, 10)}…
        </Text>
      ),
    },
    {
      key: "actions",
      title: "İşlemler",
      flex: 1,
      numeric: true,
      render: (s) => (
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <IconButton
            icon="pencil-outline"
            size={20}
            iconColor={colors.textSecondary}
            onPress={() => edit(s)}
          />
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={colors.danger}
            onPress={() => handleDelete(s)}
          />
        </View>
      ),
    },
  ];

  return (
    <DataTableView
      data={suppliers}
      columns={columns}
      rowKey={(s) => s.id!}
      onRowPress={edit}
      searchText={(s) => `${s.name} ${s.contact}`}
      searchPlaceholder="Tedarikçi ara..."
      addLabel="Yeni Tedarikçi"
      onAdd={() => router.push("/admin/supplier-form")}
      emptyIcon="truck-outline"
      emptyText="Henüz tedarikçi yok"
      emptyHint="Ürün rotalarında kullanmak için tedarikçi ekleyin."
    />
  );
}
