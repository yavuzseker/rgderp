import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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
  // İkon fontunu "MaterialCommunityIcons" adıyla yükle — react-native-paper'ın
  // beklediği aile adı tam olarak bu. Web'de @font-face otomatik enjekte edilir.
  const [fontsLoaded] = useFonts({
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
});
