import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/rgd",
      name: "landing",
      component: () => import("./views/Landing.vue"),
      meta: { title: "RGD · Kurumsal" },
    },
    {
      path: "/",
      component: () => import("./layouts/AdminLayout.vue"),
      children: [
        { path: "", name: "dashboard", component: () => import("./views/Dashboard.vue"), meta: { title: "Genel Bakış" } },
        { path: "products", name: "products", component: () => import("./views/Products.vue"), meta: { title: "Ürünler" } },
        { path: "suppliers", name: "suppliers", component: () => import("./views/Suppliers.vue"), meta: { title: "Tedarikçiler" } },
        { path: "customers", name: "customers", component: () => import("./views/Customers.vue"), meta: { title: "Müşteriler" } },
        { path: "orders", name: "orders", component: () => import("./views/Orders.vue"), meta: { title: "Siparişler" } },
        { path: "orders/:id", name: "order-detail", component: () => import("./views/OrderDetail.vue"), meta: { title: "Sipariş Detayı" } },
        { path: "projects", name: "projects", component: () => import("./views/ProjectsList.vue"), meta: { title: "Projeler" } },
        { path: "projects/:id", name: "project-detail", component: () => import("./views/ProjectDetail.vue"), meta: { title: "Proje Detayı" } },
        {
          path: "finance",
          component: () => import("./views/Finance.vue"),
          meta: { title: "Finans" },
          children: [
            { path: "", name: "finance", component: () => import("./views/finance/FinanceOverview.vue"), meta: { title: "Finans · Genel Bakış" } },
            { path: "projeler", name: "fin-projeler", component: () => import("./views/finance/ProjectFinance.vue"), meta: { title: "Finans · Proje Finansı" } },
            { path: "gelirler", name: "fin-gelirler", component: () => import("./views/finance/tables/ProjeGelirleri.vue"), meta: { title: "Finans · Proje Gelirleri" } },
            { path: "diger-gelir", name: "fin-diger-gelir", component: () => import("./views/finance/tables/DigerGelirler.vue"), meta: { title: "Finans · Diğer Gelirler" } },
            { path: "giderler", name: "fin-giderler", component: () => import("./views/finance/tables/ProjeGiderleri.vue"), meta: { title: "Finans · Proje Giderleri" } },
            { path: "sabit", name: "fin-sabit", component: () => import("./views/finance/tables/SabitGiderler.vue"), meta: { title: "Finans · Sabit Giderler" } },
            { path: "krediler", name: "fin-krediler", component: () => import("./views/finance/tables/Krediler.vue"), meta: { title: "Finans · Krediler" } },
            { path: "cekler", name: "fin-cekler", component: () => import("./views/finance/tables/Cekler.vue"), meta: { title: "Finans · Çekler" } },
          ],
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
