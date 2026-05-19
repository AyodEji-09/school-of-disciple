import { combineReducers } from "redux";
import { userApi } from "./rtk/user";
import UserSlice from "./reducers/userSlice";
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";
import { registrationApi } from "./rtk/registration";
import { settingsApi } from "./rtk/settings";
import { remittanceApi } from "./rtk/remittance";

const rootReducer = combineReducers({
  user: UserSlice,
  [userApi.reducerPath]: userApi.reducer,
  [centerApi.reducerPath]: centerApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [registrationApi.reducerPath]: registrationApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [remittanceApi.reducerPath]: remittanceApi.reducer,
});

export default rootReducer;

