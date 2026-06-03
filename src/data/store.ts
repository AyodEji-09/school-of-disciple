import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./rtk/user";
import rootReducer from "./root-reducer";
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";
import { registrationApi } from "./rtk/registration";
import { settingsApi } from "./rtk/settings";
import { remittanceApi } from "./rtk/remittance";
import { manualOrderApi } from "./rtk/manual-order";
import { transactionApi } from "./rtk/transaction";
import { notificationApi } from "./rtk/notification";
import { academicApi } from "./rtk/academic";
import { setupListeners } from "@reduxjs/toolkit/query";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(centerApi.middleware)
      .concat(paymentApi.middleware)
      .concat(registrationApi.middleware)
      .concat(settingsApi.middleware)
      .concat(remittanceApi.middleware)
      .concat(manualOrderApi.middleware)
      .concat(transactionApi.middleware)
      .concat(notificationApi.middleware)
      .concat(academicApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

