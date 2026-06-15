import { Stack } from "expo-router";
import { colors } from "../../src/theme/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Yönetim" }} />
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
