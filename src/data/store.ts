import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./rtk/user";
import rootReducer from "./root-reducer";
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";
import { registrationApi } from "./rtk/registration";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(centerApi.middleware)
      .concat(paymentApi.middleware)
      .concat(registrationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
