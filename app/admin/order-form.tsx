import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Menu,
  Surface,
  Divider,
  HelperText,
} from "react-native-paper";
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
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub1 = subscribeProducts(setProducts);
    const unsub2 = subscribeCustomers(setCustomers);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleSave = async () => {
    if (!orderNo.trim()) return setError("Sipariş no gerekli.");
    if (!selectedProduct) return setError("Ürün seçilmedi.");
    if (!selectedCustomer) return setError("Müşteri seçilmedi.");
    if (!totalQty.trim()) return setError("Toplam miktar gerekli.");

    const qty = parseInt(totalQty, 10);
    if (isNaN(qty) || qty <= 0) return setError("Geçerli bir miktar girin.");

    let dueDateTs: Timestamp;
    if (dueDate) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime()))
        return setError("Tarih formatı: YYYY-MM-DD");
      dueDateTs = Timestamp.fromDate(parsed);
    } else {
      dueDateTs = Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );
    }

    setError("");
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
      if (router.canGoBack()) router.back();
      else router.replace("/admin/orders");
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
          Yeni Sipariş
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Ürün ve müşteri seçin, sipariş üretim rotasıyla oluşturulsun.
        </Text>

        <Divider style={styles.divider} />

        <TextInput
          label="Sipariş No"
          value={orderNo}
          onChangeText={(v) => { setOrderNo(v); setError(""); }}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="pound" />}
        />

        <Menu
          visible={productMenuVisible}
          onDismiss={() => setProductMenuVisible(false)}
          anchor={
            <Button
              mode={selectedProduct ? "contained-tonal" : "outlined"}
              icon={selectedProduct ? "check-circle-outline" : "cube-outline"}
              onPress={() => setProductMenuVisible(true)}
              style={styles.selectBtn}
              contentStyle={styles.selectBtnContent}
            >
              {selectedProduct ? selectedProduct.name : "Ürün Seç"}
            </Button>
          }
        >
          {products.length === 0 ? (
            <Menu.Item title="Önce ürün ekleyin" disabled />
          ) : (
            products.map((p) => (
              <Menu.Item
                key={p.id}
                title={`${p.name} (${p.code})`}
                leadingIcon={
                  p.id === selectedProduct?.id ? "check" : "cube-outline"
                }
                onPress={() => {
                  setSelectedProduct(p);
                  setProductMenuVisible(false);
                  setError("");
                }}
              />
            ))
          )}
        </Menu>

        <Menu
          visible={customerMenuVisible}
          onDismiss={() => setCustomerMenuVisible(false)}
          anchor={
            <Button
              mode={selectedCustomer ? "contained-tonal" : "outlined"}
              icon={selectedCustomer ? "check-circle-outline" : "account-outline"}
              onPress={() => setCustomerMenuVisible(true)}
              style={styles.selectBtn}
              contentStyle={styles.selectBtnContent}
            >
              {selectedCustomer ? selectedCustomer.name : "Müşteri Seç"}
            </Button>
          }
        >
          {customers.length === 0 ? (
            <Menu.Item title="Önce müşteri ekleyin" disabled />
          ) : (
            customers.map((c) => (
              <Menu.Item
                key={c.id}
                title={c.name}
                leadingIcon={
                  c.id === selectedCustomer?.id ? "check" : "account-outline"
                }
                onPress={() => {
                  setSelectedCustomer(c);
                  setCustomerMenuVisible(false);
                  setError("");
                }}
              />
            ))
          )}
        </Menu>

        <TextInput
          label="Toplam Miktar"
          value={totalQty}
          onChangeText={(v) => { setTotalQty(v); setError(""); }}
          mode="outlined"
          keyboardType="numeric"
          style={[styles.input, styles.inputSpaced]}
          left={<TextInput.Icon icon="counter" />}
        />

        <TextInput
          label="Termin Tarihi (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={(v) => { setDueDate(v); setError(""); }}
          mode="outlined"
          placeholder="2026-12-31"
          style={styles.input}
          left={<TextInput.Icon icon="calendar-outline" />}
        />
      </Surface>

      {selectedProduct && (
        <Surface style={styles.previewCard} elevation={1}>
          <Text variant="labelLarge" style={styles.previewTitle}>
            Üretim Rotası
          </Text>
          {selectedProduct.stages
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s, i) => (
              <View key={s.key} style={styles.previewRow}>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{i + 1}</Text>
                </View>
                <Text variant="bodyMedium" style={styles.previewItem}>
                  {s.name}
                </Text>
              </View>
            ))}
        </Surface>
      )}

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
        icon="check-circle-outline"
      >
        Sipariş Oluştur
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
  inputSpaced: { marginTop: 14 },
  selectBtn: { marginBottom: 14, alignSelf: "stretch" },
  selectBtnContent: { justifyContent: "flex-start", paddingVertical: 4 },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: "#fff",
  },
  previewTitle: { color: "#1565C0", marginBottom: 12 },
  previewRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  previewBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  previewBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  previewItem: { color: "#333" },
  errorText: { fontSize: 14, textAlign: "center", marginTop: 8 },
  saveBtn: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 8,
    backgroundColor: "#1565C0",
  },
  saveBtnContent: { paddingVertical: 6 },
});
