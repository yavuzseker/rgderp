import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text, Chip, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { subscribeOrders } from "../../src/services/orders";
import type { Order } from "../../src/types";
import { colors } from "../../src/theme/colors";
import { DataTableView, Column } from "../../src/components/DataTableView";

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "Üretimde",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  open: colors.open,
  in_progress: colors.inProgress,
  completed: colors.completed,
  cancelled: colors.cancelled,
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => subscribeOrders(setOrders), []);

  const open = (o: Order) =>
    router.push({ pathname: "/admin/order-detail", params: { id: o.id } });

  const columns: Column<Order>[] = [
    {
      key: "orderNo",
      title: "Sipariş No",
      flex: 1.6,
      sortValue: (o) => o.orderNo.toLocaleLowerCase("tr"),
      render: (o) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar.Icon
            size={34}
            icon="clipboard-text-outline"
            color="#fff"
            style={{ backgroundColor: colors.order }}
          />
          <Text style={{ fontWeight: "700", color: colors.textPrimary }}>
            {o.orderNo}
          </Text>
        </View>
      ),
    },
    {
      key: "product",
      title: "Ürün",
      flex: 1.8,
      sortValue: (o) => o.productName.toLocaleLowerCase("tr"),
      render: (o) => (
        <Text style={{ color: colors.textSecondary }}>{o.productName}</Text>
      ),
    },
    {
      key: "customer",
      title: "Müşteri",
      flex: 1.6,
      sortValue: (o) => o.customerName.toLocaleLowerCase("tr"),
      render: (o) => (
        <Text style={{ color: colors.textSecondary }}>{o.customerName}</Text>
      ),
    },
    {
      key: "qty",
      title: "Miktar",
      flex: 1,
      numeric: true,
      sortValue: (o) => o.totalQty,
      render: (o) => (
        <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
          {o.totalQty}
        </Text>
      ),
    },
    {
      key: "status",
      title: "Durum",
      flex: 1.3,
      numeric: true,
      sortValue: (o) => o.status,
      render: (o) => (
        <Chip
          compact
          style={{ backgroundColor: statusColors[o.status] + "1A", alignSelf: "flex-end" }}
          textStyle={{
            color: statusColors[o.status],
            fontSize: 11,
            fontWeight: "700",
          }}
        >
          {statusLabels[o.status]}
        </Chip>
      ),
    },
  ];

  return (
    <DataTableView
      data={orders}
      columns={columns}
      rowKey={(o) => o.id!}
      onRowPress={open}
      searchText={(o) => `${o.orderNo} ${o.productName} ${o.customerName}`}
      searchPlaceholder="Sipariş ara..."
      addLabel="Yeni Sipariş"
      onAdd={() => router.push("/admin/order-form")}
      emptyIcon="clipboard-list-outline"
      emptyText="Henüz sipariş yok"
      emptyHint="Yeni sipariş açmak için yukarıdaki butonu kullanın."
    />
  );
}
