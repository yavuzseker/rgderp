import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1565C0",
    secondary: "#42A5F5",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1565C0" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen name="index" options={{ title: "RGD-ERP" }} />
        <Stack.Screen
          name="admin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="supplier"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="customer"
          options={{ headerShown: false }}
        />
      </Stack>
    </PaperProvider>
  );
}
