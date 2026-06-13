import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, View } from "react-native";
import { TextInput, Button, Text, Menu } from "react-native-paper";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { createOrder } from "../../src/services/orders";
import { subscribeProducts } from "../../src/services/products";
import { subscribeCustomers } from "../../src/services/customers";
import type { Product, Customer } from "../../src/types";

export default function OrderForm() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderNo, setOrderNo] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [totalQty, setTotalQty] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [productMenuVisible, setProductMenuVisible] = useState(false);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeProducts(setProducts);
    const unsub2 = subscribeCustomers(setCustomers);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleSave = async () => {
    if (!orderNo.trim() || !selectedProduct || !selectedCustomer || !totalQty) {
      Alert.alert("Hata", "Tüm alanları doldurun.");
      return;
    }

    const qty = parseInt(totalQty, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Hata", "Geçerli bir miktar girin.");
      return;
    }

    let dueDateTs: Timestamp;
    if (dueDate) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        Alert.alert("Hata", "Tarih formatı: YYYY-MM-DD");
        return;
      }
      dueDateTs = Timestamp.fromDate(parsed);
    } else {
      dueDateTs = Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );
    }

    setLoading(true);
    try {
      await createOrder(
        {
          orderNo,
          productId: selectedProduct.id!,
          productName: selectedProduct.name,
          customerId: selectedCustomer.id!,
          customerName: selectedCustomer.name,
          totalQty: qty,
          dueDate: dueDateTs,
        },
        selectedProduct
      );
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
        Yeni Sipariş
      </Text>

      <TextInput
        label="Sipariş No"
        value={orderNo}
        onChangeText={setOrderNo}
        mode="outlined"
        style={styles.input}
      />

      <Menu
        visible={productMenuVisible}
        onDismiss={() => setProductMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setProductMenuVisible(true)}
            style={styles.input}
            contentStyle={styles.menuBtn}
          >
            Ürün: {selectedProduct?.name ?? "Seçin"}
          </Button>
        }
      >
        {products.map((p) => (
          <Menu.Item
            key={p.id}
            title={`${p.name} (${p.code})`}
            onPress={() => {
              setSelectedProduct(p);
              setProductMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Menu
        visible={customerMenuVisible}
        onDismiss={() => setCustomerMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setCustomerMenuVisible(true)}
            style={styles.input}
            contentStyle={styles.menuBtn}
          >
            Müşteri: {selectedCustomer?.name ?? "Seçin"}
          </Button>
        }
      >
        {customers.map((c) => (
          <Menu.Item
            key={c.id}
            title={c.name}
            onPress={() => {
              setSelectedCustomer(c);
              setCustomerMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <TextInput
        label="Toplam Miktar"
        value={totalQty}
        onChangeText={setTotalQty}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Termin Tarihi (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
        mode="outlined"
        placeholder="2025-12-31"
        style={styles.input}
      />

      {selectedProduct && (
        <View style={styles.preview}>
          <Text variant="labelLarge">Üretim Rotası:</Text>
          {selectedProduct.stages
            .sort((a, b) => a.order - b.order)
            .map((s, i) => (
              <Text key={s.key} variant="bodySmall" style={styles.previewItem}>
                {i + 1}. {s.name}
              </Text>
            ))}
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        style={styles.saveBtn}
      >
        Sipariş Oluştur
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  heading: { marginBottom: 16, fontWeight: "bold" },
  input: { marginBottom: 12 },
  menuBtn: { justifyContent: "flex-start" },
  preview: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewItem: { marginTop: 4, color: "#333" },
  saveBtn: { marginBottom: 40 },
});
