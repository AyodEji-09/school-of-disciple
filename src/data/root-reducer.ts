import { combineReducers } from "redux";
import { userApi } from "./rtk/user";
import UserSlice from "./reducers/userSlice";
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";
import { registrationApi } from "./rtk/registration";

const rootReducer = combineReducers({
  user: UserSlice,
  [userApi.reducerPath]: userApi.reducer,
  [centerApi.reducerPath]: centerApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [registrationApi.reducerPath]: registrationApi.reducer,
});

export default rootReducer;
