import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Surface, Chip, ProgressBar, Button } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import {
  getOrder,
  subscribeStages,
  updateStage,
  updateOrder,
} from "../../src/services/orders";
import { subscribeSuppliers } from "../../src/services/suppliers";
import type { Order, Stage, Supplier } from "../../src/types";
import { Timestamp } from "firebase/firestore";

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  active: "Aktif",
  done: "Tamamlandı",
};
const statusColors: Record<string, string> = {
  pending: "#9E9E9E",
  active: "#FF9800",
  done: "#4CAF50",
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (!id) return;
    getOrder(id).then(setOrder);
    const unsub1 = subscribeStages(id, setStages);
    const unsub2 = subscribeSuppliers(setSuppliers);
    return () => {
      unsub1();
      unsub2();
    };
  }, [id]);

  if (!order) return <Text style={styles.loading}>Yükleniyor...</Text>;

  const doneCount = stages.filter((s) => s.status === "done").length;
  const progress = stages.length > 0 ? doneCount / stages.length : 0;

  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name ?? "—";

  const activateNextStage = async () => {
    const currentActive = stages.find((s) => s.status === "active");
    if (!currentActive) return;

    await updateStage(id!, currentActive.id!, {
      status: "done",
      completedAt: Timestamp.now(),
    });

    const nextStage = stages.find((s) => s.index === currentActive.index + 1);
    if (nextStage) {
      await updateStage(id!, nextStage.id!, {
        status: "active",
        startedAt: Timestamp.now(),
        inQty: currentActive.outQty,
      });
      await updateOrder(id!, {
        status: "in_progress",
        currentStageIndex: nextStage.index,
      });
    } else {
      await updateOrder(id!, { status: "completed" });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="titleLarge">{order.orderNo}</Text>
        <Text variant="bodyMedium">
          {order.productName} · {order.customerName}
        </Text>
        <Text variant="bodySmall" style={styles.qty}>
          Toplam: {order.totalQty} adet
        </Text>
        <View style={styles.progressRow}>
          <Text variant="labelSmall">
            İlerleme: {Math.round(progress * 100)}%
          </Text>
          <ProgressBar
            progress={progress}
            color="#4CAF50"
            style={styles.progressBar}
          />
        </View>
      </Surface>

      <Text variant="titleMedium" style={styles.stagesTitle}>
        Aşamalar
      </Text>

      {stages.map((stage) => (
        <Surface key={stage.id} style={styles.stageCard} elevation={1}>
          <View style={styles.stageRow}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall">
                {stage.index + 1}. {stage.name}
              </Text>
              <Text variant="bodySmall" style={styles.supplierText}>
                Tedarikçi: {getSupplierName(stage.supplierId)}
              </Text>
            </View>
            <Chip
              compact
              style={{
                backgroundColor: statusColors[stage.status] + "20",
              }}
              textStyle={{
                color: statusColors[stage.status],
                fontSize: 11,
              }}
            >
              {statusLabels[stage.status]}
            </Chip>
          </View>
          <View style={styles.qtyRow}>
            <Text variant="bodySmall">
              Giren: {stage.inQty} · Çıkan: {stage.outQty} · Fire:{" "}
              {stage.scrapQty}
            </Text>
          </View>
          {stage.status === "active" && (
            <Button
              mode="contained-tonal"
              compact
              onPress={activateNextStage}
              style={styles.nextBtn}
            >
              Aşamayı Tamamla & Sonrakine Geç
            </Button>
          )}
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  loading: { textAlign: "center", marginTop: 40 },
  header: { padding: 16, borderRadius: 8, marginBottom: 16 },
  qty: { marginTop: 4, color: "#666" },
  progressRow: { marginTop: 12 },
  progressBar: { marginTop: 4, height: 6, borderRadius: 3 },
  stagesTitle: { marginBottom: 12, fontWeight: "bold" },
  stageCard: { padding: 12, borderRadius: 8, marginBottom: 10 },
  stageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  supplierText: { color: "#666", marginTop: 2 },
  qtyRow: { marginTop: 8 },
  nextBtn: { marginTop: 8 },
});
