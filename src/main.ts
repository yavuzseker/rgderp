import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";

import App from "./App.vue";
import { router } from "./router";
import { RgdPreset } from "./theme";

import "primeicons/primeicons.css";
import "./style.css";

import { startListeners } from "./data/store";
import { startFinanceListeners } from "./data/financeStore";
startListeners();
startFinanceListeners();

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: RgdPreset,
    options: {
      darkModeSelector: ".dark-mode-never",
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.directive("tooltip", Tooltip);

app.mount("#app");
