import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Text,
  IconButton,
  Surface,
  Menu,
  HelperText,
  Divider,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { addProduct, getProduct, updateProduct } from "../../src/services/products";
import { subscribeSuppliers } from "../../src/services/suppliers";
import type { Product, StageTemplate, Supplier } from "../../src/types";

export default function ProductForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [stages, setStages] = useState<StageTemplate[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => subscribeSuppliers(setSuppliers), []);

  useEffect(() => {
    if (id) {
      getProduct(id).then((p) => {
        if (p) {
          setName(p.name);
          setCode(p.code);
          setStages(p.stages);
        }
      });
    }
  }, [id]);

  const addStage = () => {
    setStages([
      ...stages,
      {
        key: `stage_${Date.now()}`,
        name: "",
        defaultSupplierId: "",
        order: stages.length,
      },
    ]);
  };

  const updateStage = (index: number, field: keyof StageTemplate, value: string | number) => {
    const updated = [...stages];
    (updated[index] as any)[field] = value;
    setStages(updated);
  };

  const removeStage = (index: number) => {
    const updated = stages.filter((_, i) => i !== index);
    updated.forEach((s, i) => (s.order = i));
    setStages(updated);
  };

  const moveStage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stages.length) return;
    const updated = [...stages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s, i) => (s.order = i));
    setStages(updated);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Ürün adı gerekli.";
    if (!code.trim()) return "Ürün kodu gerekli.";
    if (stages.length === 0) return "En az bir üretim aşaması ekleyin.";
    for (let i = 0; i < stages.length; i++) {
      if (!stages[i].name.trim()) return `Aşama ${i + 1}: Ad boş bırakılamaz.`;
      if (!stages[i].defaultSupplierId)
        return `Aşama ${i + 1}: Tedarikçi seçilmedi.`;
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data: Omit<Product, "id"> = { name, code, stages };
      if (isEdit) {
        await updateProduct(id!, data);
      } else {
        await addProduct(data);
      }
      router.back();
    } catch (e: any) {
      setError(e.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name ?? "";

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleLarge" style={styles.heading}>
          {isEdit ? "Ürünü Düzenle" : "Yeni Ürün Tanımla"}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Ürün bilgilerini ve üretim rotasını girin.
        </Text>

        <Divider style={styles.divider} />

        <TextInput
          label="Ürün Adı"
          value={name}
          onChangeText={(v) => { setName(v); setError(""); }}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="tag-outline" />}
        />
        <TextInput
          label="Ürün Kodu"
          value={code}
          onChangeText={(v) => { setCode(v); setError(""); }}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="barcode" />}
        />
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Üretim Aşamaları (Rota)
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Sırayla üretim aşamalarını ekleyin. Her aşamaya sorumlu tedarikçi atayın.
        </Text>

        {stages.length === 0 && (
          <View style={styles.emptyStages}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Henüz aşama eklenmedi
            </Text>
          </View>
        )}

        {stages.map((stage, i) => (
          <Surface key={stage.key} style={styles.stageCard} elevation={0}>
            <View style={styles.stageHeader}>
              <View style={styles.stageBadge}>
                <Text style={styles.stageBadgeText}>{i + 1}</Text>
              </View>
              <View style={styles.stageActions}>
                <IconButton
                  icon="chevron-up"
                  size={18}
                  onPress={() => moveStage(i, -1)}
                  disabled={i === 0}
                />
                <IconButton
                  icon="chevron-down"
                  size={18}
                  onPress={() => moveStage(i, 1)}
                  disabled={i === stages.length - 1}
                />
                <IconButton
                  icon="close-circle-outline"
                  size={18}
                  iconColor="#E53935"
                  onPress={() => removeStage(i)}
                />
              </View>
            </View>
            <TextInput
              label="Aşama Adı"
              placeholder="Örn: Talaşlı İmalat, Kaplama..."
              value={stage.name}
              onChangeText={(v) => { updateStage(i, "name", v); setError(""); }}
              mode="outlined"
              dense
              style={styles.stageInput}
            />
            <Menu
              visible={menuVisible === i}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <Button
                  mode={stage.defaultSupplierId ? "contained-tonal" : "outlined"}
                  compact
                  icon={stage.defaultSupplierId ? "check-circle-outline" : "account-hard-hat"}
                  onPress={() => setMenuVisible(i)}
                  style={styles.supplierBtn}
                  labelStyle={styles.supplierBtnLabel}
                >
                  {stage.defaultSupplierId
                    ? getSupplierName(stage.defaultSupplierId)
                    : "Tedarikçi Seç"}
                </Button>
              }
            >
              {suppliers.length === 0 ? (
                <Menu.Item title="Önce tedarikçi ekleyin" disabled />
              ) : (
                suppliers.map((s) => (
                  <Menu.Item
                    key={s.id}
                    title={s.name}
                    leadingIcon={
                      s.id === stage.defaultSupplierId
                        ? "check"
                        : "account-outline"
                    }
                    onPress={() => {
                      updateStage(i, "defaultSupplierId", s.id!);
                      setMenuVisible(null);
                      setError("");
                    }}
                  />
                ))
              )}
            </Menu>
          </Surface>
        ))}

        <Button
          mode="outlined"
          icon="plus-circle-outline"
          onPress={addStage}
          style={styles.addBtn}
        >
          Aşama Ekle
        </Button>
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
        {isEdit ? "Güncelle" : "Ürünü Kaydet"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  heading: { fontWeight: "bold", color: "#1a1a1a" },
  subtitle: { color: "#888", marginTop: 4 },
  divider: { marginVertical: 16 },
  input: { marginBottom: 14, backgroundColor: "#fff" },
  sectionTitle: { fontWeight: "bold", color: "#1a1a1a", marginBottom: 4 },
  emptyStages: {
    paddingVertical: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    marginTop: 12,
  },
  emptyText: { color: "#999" },
  stageCard: {
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stageBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
  },
  stageBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  stageActions: { flexDirection: "row" },
  stageInput: { marginBottom: 10, backgroundColor: "#fff" },
  supplierBtn: { alignSelf: "flex-start", marginTop: 2 },
  supplierBtnLabel: { fontSize: 13 },
  addBtn: { marginTop: 14 },
  errorText: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  saveBtn: {
    marginBottom: 40,
    borderRadius: 8,
    backgroundColor: "#1565C0",
  },
  saveBtnContent: { paddingVertical: 6 },
});
