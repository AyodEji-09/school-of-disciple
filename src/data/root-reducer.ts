import { combineReducers } from "redux";
import { userApi } from "./rtk/user";
import UserSlice from "./reducers/userSlice";
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";
import { registrationApi } from "./rtk/registration";
import { settingsApi } from "./rtk/settings";
import { remittanceApi } from "./rtk/remittance";
import { manualOrderApi } from "./rtk/manual-order";
import { transactionApi } from "./rtk/transaction";
import { notificationApi } from "./rtk/notification";

const rootReducer = combineReducers({
  user: UserSlice,
  [userApi.reducerPath]: userApi.reducer,
  [centerApi.reducerPath]: centerApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [registrationApi.reducerPath]: registrationApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [remittanceApi.reducerPath]: remittanceApi.reducer,
  [manualOrderApi.reducerPath]: manualOrderApi.reducer,
  [transactionApi.reducerPath]: transactionApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

export default rootReducer;

