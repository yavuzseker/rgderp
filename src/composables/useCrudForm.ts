import { reactive, ref } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

/**
 * Tablo + dialog tabanlı CRUD ekranları için paylaşılan form mantığı.
 * Tedarikçiler, Müşteriler ve Ürünler ekranları aynı kalıbı kullanır
 * (aç/düzenle/kaydet/sil + toast & onay diyaloğu).
 */
export function useCrudForm<T extends { id?: string }>(opts: {
  /** Boş bir form nesnesi üretir (yeni kayıt için). */
  empty: () => T;
  /** Kaydı kalıcı hale getirir (store.save*). */
  save: (value: T) => unknown;
  /** Kaydı siler (store.delete*). */
  remove: (id: string) => unknown;
  /** Kaydetmeden önce doğrulama; false dönerse kayıt iptal. */
  validate?: (value: T) => boolean;
  /** Düzenleme için derin kopya gerekiyorsa (örn. iç içe diziler). */
  clone?: (value: T) => T;
  /** Toast ve onay mesajlarında gösterilecek etiket. */
  label: (value: T) => string;
}) {
  const confirm = useConfirm();
  const toast = useToast();

  const dialog = ref(false);
  const submitted = ref(false);
  const form = reactive(opts.empty()) as T;

  function open(value: T) {
    Object.assign(form, value);
    submitted.value = false;
    dialog.value = true;
  }

  function openNew() {
    open(opts.empty());
    delete (form as { id?: string }).id;
  }

  function openEdit(item: T) {
    open(opts.clone ? opts.clone(item) : { ...item });
  }

  function save() {
    submitted.value = true;
    if (opts.validate && !opts.validate(form)) return;
    const editing = !!form.id;
    opts.save(form);
    toast.add({
      severity: "success",
      summary: editing ? "Güncellendi" : "Eklendi",
      detail: opts.label(form),
      life: 2500,
    });
    dialog.value = false;
  }

  function confirmDelete(item: T) {
    confirm.require({
      header: "Silme onayı",
      message: `"${opts.label(item)}" silinsin mi?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sil",
      rejectLabel: "Vazgeç",
      acceptProps: { severity: "danger" },
      accept: () => {
        opts.remove(item.id!);
        toast.add({ severity: "info", summary: "Silindi", detail: opts.label(item), life: 2500 });
      },
    });
  }

  return { dialog, submitted, form, openNew, openEdit, save, confirmDelete };
}
