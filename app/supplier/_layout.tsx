import { Stack } from "expo-router";

export default function SupplierLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FF9800" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tedarikçi Paneli" }} />
    </Stack>
  );
}
