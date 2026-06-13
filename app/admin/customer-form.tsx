import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  addCustomer,
  updateCustomer,
  subscribeCustomers,
} from "../../src/services/customers";

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function CustomerForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [accessToken, setAccessToken] = useState(generateToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const unsub = subscribeCustomers((list) => {
        const found = list.find((c) => c.id === id);
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
      Alert.alert("Hata", "Müşteri adı gerekli.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateCustomer(id!, { name, contact, accessToken });
      } else {
        await addCustomer({ name, contact, accessToken });
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.heading}>
        {isEdit ? "Müşteri Düzenle" : "Yeni Müşteri"}
      </Text>
      <TextInput
        label="Müşteri Adı"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="İletişim (telefon/e-posta)"
        value={contact}
        onChangeText={setContact}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Erişim Tokeni"
        value={accessToken}
        onChangeText={setAccessToken}
        mode="outlined"
        style={styles.input}
        right={
          <TextInput.Icon
            icon="refresh"
            onPress={() => setAccessToken(generateToken())}
          />
        }
      />
      <Text variant="bodySmall" style={styles.hint}>
        Bu token ile müşteri sipariş durumunu takip eder.
      </Text>
      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.saveBtn}
      >
        {isEdit ? "Güncelle" : "Kaydet"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  heading: { marginBottom: 16, fontWeight: "bold" },
  input: { marginBottom: 12 },
  hint: { color: "#888", marginBottom: 20 },
  saveBtn: { marginBottom: 40 },
});
