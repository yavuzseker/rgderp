import { useEffect, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, Avatar, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeProducts, deleteProduct } from "../../src/services/products";
import type { Product } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { DataTableView, Column } from "../../src/components/DataTableView";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => subscribeProducts(setProducts), []);

  const handleDelete = (p: Product) => {
    if (typeof window !== "undefined" && window.confirm(`"${p.name}" silinsin mi?`)) {
      deleteProduct(p.id!);
    }
  };

  const edit = (p: Product) =>
    router.push({ pathname: "/admin/product-form", params: { id: p.id } });

  const columns: Column<Product>[] = [
    {
      key: "name",
      title: "Ürün Adı",
      flex: 2.4,
      sortValue: (p) => p.name.toLocaleLowerCase("tr"),
      render: (p) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar.Icon
            size={34}
            icon="cube-outline"
            color="#fff"
            style={{ backgroundColor: colors.product }}
          />
          <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
            {p.name}
          </Text>
        </View>
      ),
    },
    {
      key: "code",
      title: "Kod",
      flex: 1.4,
      sortValue: (p) => p.code.toLocaleLowerCase("tr"),
      render: (p) => (
        <Chip
          compact
          style={{ backgroundColor: "#EEF2FF", alignSelf: "flex-start", height: 26 }}
          textStyle={{ color: colors.product, fontSize: 11, fontWeight: "600", lineHeight: 14 }}
        >
          {p.code}
        </Chip>
      ),
    },
    {
      key: "stages",
      title: "Aşama",
      flex: 1,
      numeric: true,
      sortValue: (p) => p.stages.length,
      render: (p) => (
        <Text style={{ color: colors.textSecondary }}>{p.stages.length}</Text>
      ),
    },
    {
      key: "actions",
      title: "İşlemler",
      flex: 1,
      numeric: true,
      render: (p) => (
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <IconButton
            icon="pencil-outline"
            size={20}
            iconColor={colors.textSecondary}
            onPress={() => edit(p)}
          />
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={colors.danger}
            onPress={() => handleDelete(p)}
          />
        </View>
      ),
    },
  ];

  return (
    <DataTableView
      data={products}
      columns={columns}
      rowKey={(p) => p.id!}
      onRowPress={edit}
      searchText={(p) => `${p.name} ${p.code}`}
      searchPlaceholder="Ürün ara..."
      addLabel="Yeni Ürün"
      onAdd={() => router.push("/admin/product-form")}
      emptyIcon="cube-outline"
      emptyText="Henüz ürün yok"
      emptyHint="İlk ürününüzü ve üretim rotasını tanımlayın."
    />
  );
}
