import { ReactNode, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  DataTable,
  Searchbar,
  Button,
  Text,
  Surface,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { MotionView } from "./MotionView";

export interface Column<T> {
  key: string;
  title: string;
  /** Esneklik oranı (genişlik) */
  flex?: number;
  numeric?: boolean;
  /** Hücre içeriğini render eder */
  render: (row: T) => ReactNode;
  /** Sıralama için karşılaştırma değeri; verilirse sütun sıralanabilir olur */
  sortValue?: (row: T) => string | number;
}

interface DataTableViewProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowPress?: (row: T) => void;
  /** Arama kutusunda eşleştirilecek metni döndürür */
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  addLabel: string;
  onAdd: () => void;
  emptyIcon: string;
  emptyText: string;
  emptyHint?: string;
  pageSize?: number;
}

export function DataTableView<T>({
  data,
  columns,
  rowKey,
  onRowPress,
  searchText,
  searchPlaceholder = "Ara...",
  addLabel,
  onAdd,
  emptyIcon,
  emptyText,
  emptyHint,
  pageSize = 10,
}: DataTableViewProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return data;
    return data.filter((row) =>
      searchText(row).toLocaleLowerCase("tr").includes(q)
    );
  }, [data, query, searchText]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const arr = [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortAsc, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Searchbar
          placeholder={searchPlaceholder}
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setPage(0);
          }}
          style={styles.search}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
        <Button
          mode="contained"
          icon="plus"
          onPress={onAdd}
          style={styles.addBtn}
          contentStyle={styles.addBtnContent}
          labelStyle={styles.addBtnLabel}
        >
          {addLabel}
        </Button>
      </View>

      <Surface style={styles.card} elevation={1}>
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name={emptyIcon as any}
              size={56}
              color={colors.border}
            />
            <Text variant="titleMedium" style={styles.emptyText}>
              {query ? "Sonuç bulunamadı" : emptyText}
            </Text>
            {!query && emptyHint && (
              <Text variant="bodySmall" style={styles.emptyHint}>
                {emptyHint}
              </Text>
            )}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <DataTable>
                <DataTable.Header style={styles.header}>
                  {columns.map((col) => (
                    <DataTable.Title
                      key={col.key}
                      numeric={col.numeric}
                      sortDirection={
                        sortKey === col.key
                          ? sortAsc
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      onPress={
                        col.sortValue ? () => toggleSort(col.key) : undefined
                      }
                      style={[{ flex: col.flex ?? 1 }]}
                      textStyle={styles.headerText}
                    >
                      {col.title}
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                {pageRows.map((row, i) => (
                  <MotionView key={rowKey(row)} delay={i * 35} offsetY={8}>
                    <DataTable.Row
                      onPress={onRowPress ? () => onRowPress(row) : undefined}
                      style={styles.row}
                    >
                      {columns.map((col) => (
                        <DataTable.Cell
                          key={col.key}
                          numeric={col.numeric}
                          style={[{ flex: col.flex ?? 1 }]}
                        >
                          {col.render(row)}
                        </DataTable.Cell>
                      ))}
                    </DataTable.Row>
                  </MotionView>
                ))}
              </DataTable>
            </View>
          </ScrollView>
        )}

        {sorted.length > pageSize && (
          <DataTable.Pagination
            page={safePage}
            numberOfPages={pageCount}
            onPageChange={setPage}
            label={`${safePage * pageSize + 1}-${Math.min(
              (safePage + 1) * pageSize,
              sorted.length
            )} / ${sorted.length}`}
            showFastPaginationControls
            style={styles.pagination}
          />
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  search: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: { fontSize: 14, minHeight: 0 },
  addBtn: { borderRadius: 12, backgroundColor: colors.primary },
  addBtnContent: { paddingVertical: 6, paddingHorizontal: 8, flexDirection: "row-reverse" },
  addBtnLabel: { fontWeight: "700" },
  card: { borderRadius: 16, overflow: "hidden", backgroundColor: colors.surface },
  tableInner: { minWidth: "100%" },
  header: {
    backgroundColor: "#F8FAFC",
    borderBottomColor: colors.border,
  },
  headerText: { color: colors.textSecondary, fontWeight: "700", fontSize: 13 },
  row: { borderBottomColor: "#F1F5F9", minHeight: 56 },
  pagination: { justifyContent: "flex-end" },
  empty: { alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 },
  emptyText: { color: colors.textSecondary, marginTop: 14, fontWeight: "700" },
  emptyHint: { color: colors.textMuted, marginTop: 6, textAlign: "center" },
});
