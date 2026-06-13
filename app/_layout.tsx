import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { Platform } from "react-native";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1565C0",
    secondary: "#42A5F5",
  },
};

if (Platform.OS === "web") {
  const iconFont = require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf");
  const style = document.createElement("style");
  style.textContent = `@font-face { font-family: 'MaterialCommunityIcons'; src: url(${iconFont}) format('truetype'); }`;
  document.head.appendChild(style);
}

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
