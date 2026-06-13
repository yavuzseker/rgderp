import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1565C0" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Paneli" }} />
      <Stack.Screen name="products" options={{ title: "Ürünler" }} />
      <Stack.Screen name="product-form" options={{ title: "Ürün Tanımla" }} />
      <Stack.Screen name="suppliers" options={{ title: "Tedarikçiler" }} />
      <Stack.Screen name="supplier-form" options={{ title: "Tedarikçi Tanımla" }} />
      <Stack.Screen name="customers" options={{ title: "Müşteriler" }} />
      <Stack.Screen name="customer-form" options={{ title: "Müşteri Tanımla" }} />
      <Stack.Screen name="orders" options={{ title: "Siparişler" }} />
      <Stack.Screen name="order-form" options={{ title: "Sipariş Aç" }} />
      <Stack.Screen name="order-detail" options={{ title: "Sipariş Detay" }} />
    </Stack>
  );
}
