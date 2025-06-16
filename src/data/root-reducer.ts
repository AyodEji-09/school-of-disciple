import { combineReducers } from "redux";
import { userApi } from "./rtk/user";
import UserSlice from './reducers/userSlice'
import { centerApi } from "./rtk/center";

const rootReducer = combineReducers({
  user: UserSlice,
  [userApi.reducerPath]: userApi.reducer,
  [centerApi.reducerPath]: centerApi.reducer,
});

export default rootReducer;
