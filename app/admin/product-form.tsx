import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  IconButton,
  Surface,
  Menu,
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

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert("Hata", "Ürün adı ve kodu gerekli.");
      return;
    }
    if (stages.length === 0) {
      Alert.alert("Hata", "En az bir aşama ekleyin.");
      return;
    }

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
      Alert.alert("Hata", e.message);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name ?? "Seçilmedi";

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.heading}>
        {isEdit ? "Ürünü Düzenle" : "Yeni Ürün"}
      </Text>

      <TextInput
        label="Ürün Adı"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Ürün Kodu"
        value={code}
        onChangeText={setCode}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="titleSmall" style={styles.stagesHeading}>
        Üretim Aşamaları (Rota)
      </Text>

      {stages.map((stage, i) => (
        <Surface key={stage.key} style={styles.stageCard} elevation={1}>
          <View style={styles.stageHeader}>
            <Text variant="labelLarge">Aşama {i + 1}</Text>
            <View style={styles.stageActions}>
              <IconButton
                icon="arrow-up"
                size={18}
                onPress={() => moveStage(i, -1)}
                disabled={i === 0}
              />
              <IconButton
                icon="arrow-down"
                size={18}
                onPress={() => moveStage(i, 1)}
                disabled={i === stages.length - 1}
              />
              <IconButton
                icon="close"
                size={18}
                onPress={() => removeStage(i)}
              />
            </View>
          </View>
          <TextInput
            label="Aşama Adı"
            value={stage.name}
            onChangeText={(v) => updateStage(i, "name", v)}
            mode="outlined"
            dense
            style={styles.stageInput}
          />
          <Menu
            visible={menuVisible === i}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                mode="outlined"
                compact
                onPress={() => setMenuVisible(i)}
                style={styles.stageInput}
              >
                Tedarikçi: {getSupplierName(stage.defaultSupplierId)}
              </Button>
            }
          >
            {suppliers.map((s) => (
              <Menu.Item
                key={s.id}
                title={s.name}
                onPress={() => {
                  updateStage(i, "defaultSupplierId", s.id!);
                  setMenuVisible(null);
                }}
              />
            ))}
          </Menu>
        </Surface>
      ))}

      <Button
        mode="outlined"
        icon="plus"
        onPress={addStage}
        style={styles.addBtn}
      >
        Aşama Ekle
      </Button>

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
  stagesHeading: { marginTop: 8, marginBottom: 12, fontWeight: "bold" },
  stageCard: { padding: 12, borderRadius: 8, marginBottom: 12 },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageActions: { flexDirection: "row" },
  stageInput: { marginTop: 8 },
  addBtn: { marginBottom: 16 },
  saveBtn: { marginBottom: 40 },
});
