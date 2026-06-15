import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../src/theme/colors";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.bg,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider
      theme={theme}
      // Paper'ın tüm ikonlarını @expo/vector-icons üzerinden render et.
      // Bu bileşen web'de kendi fontunu otomatik yükler → ikonlar düzgün çıkar.
      settings={{
        icon: (props) => <MaterialCommunityIcons {...(props as any)} />,
      }}
    >
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="supplier" options={{ headerShown: false }} />
        <Stack.Screen name="customer" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
