import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  Divider,
  HelperText,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  addSupplier,
  updateSupplier,
  subscribeSuppliers,
} from "../../src/services/suppliers";

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function SupplierForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [accessToken, setAccessToken] = useState(generateToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const unsub = subscribeSuppliers((list) => {
        const found = list.find((s) => s.id === id);
        if (found) {
          setName(found.name);
          setContact(found.contact);
          setAccessToken(found.accessToken);
        }
      });
      return unsub;
    }
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tedarikçi adı gerekli.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await updateSupplier(id!, { name, contact, accessToken });
      } else {
        await addSupplier({ name, contact, accessToken });
      }
      router.back();
    } catch (e: any) {
      setError(e.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleLarge" style={styles.heading}>
          {isEdit ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Tedarikçi bilgilerini girin. Erişim tokeni otomatik oluşturulur.
        </Text>

        <Divider style={styles.divider} />

        <TextInput
          label="Firma Adı"
          value={name}
          onChangeText={(v) => { setName(v); setError(""); }}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="domain" />}
        />
        <TextInput
          label="İletişim (telefon / e-posta)"
          value={contact}
          onChangeText={setContact}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="phone-outline" />}
        />

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.tokenLabel}>
          Erişim Tokeni
        </Text>
        <View style={styles.tokenRow}>
          <TextInput
            value={accessToken}
            onChangeText={setAccessToken}
            mode="outlined"
            dense
            style={styles.tokenInput}
            left={<TextInput.Icon icon="key-outline" />}
          />
          <Button
            mode="contained-tonal"
            icon="refresh"
            compact
            onPress={() => setAccessToken(generateToken())}
            style={styles.tokenRefresh}
          >
            Yenile
          </Button>
        </View>
        <Text variant="bodySmall" style={styles.hint}>
          Bu token ile tedarikçi şifresiz giriş yapar. Paylaşılacak link
          oluşturulurken kullanılır.
        </Text>
      </Surface>

      {error !== "" && (
        <HelperText type="error" visible style={styles.errorText}>
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.saveBtn}
        contentStyle={styles.saveBtnContent}
        icon={isEdit ? "content-save-outline" : "check-circle-outline"}
      >
        {isEdit ? "Güncelle" : "Tedarikçi Kaydet"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
  card: { padding: 20, borderRadius: 12, backgroundColor: "#fff" },
  heading: { fontWeight: "bold", color: "#1a1a1a" },
  subtitle: { color: "#888", marginTop: 4 },
  divider: { marginVertical: 16 },
  input: { marginBottom: 14, backgroundColor: "#fff" },
  tokenLabel: { marginBottom: 8, color: "#555" },
  tokenRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  tokenInput: { flex: 1, backgroundColor: "#fff" },
  tokenRefresh: { marginTop: 4 },
  hint: { color: "#888", marginTop: 8 },
  errorText: { fontSize: 14, textAlign: "center", marginTop: 8 },
  saveBtn: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 8,
    backgroundColor: "#1565C0",
  },
  saveBtnContent: { paddingVertical: 6 },
});
