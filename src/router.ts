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
        { path: "finance", name: "finance", component: () => import("./views/Finance.vue"), meta: { title: "Finans" } },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
