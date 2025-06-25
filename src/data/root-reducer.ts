import { combineReducers } from "redux";
import { userApi } from "./rtk/user";
import UserSlice from './reducers/userSlice'
import { centerApi } from "./rtk/center";
import { paymentApi } from "./rtk/payment";

const rootReducer = combineReducers({
  user: UserSlice,
  [userApi.reducerPath]: userApi.reducer,
  [centerApi.reducerPath]: centerApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
});

export default rootReducer;
