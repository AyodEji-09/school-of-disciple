import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { SetAuthToken, SetDefaultHeaders, TOKEN } from "../config";
import axios from "axios";

interface UserState {
  isAuth: boolean;
  user: User | null;
  loading: boolean;
}

export type Login = {
  token?: string;
  user: User | null;
};

const initialState: UserState = {
  isAuth: false,
  user: null,
  loading: !!localStorage.getItem(TOKEN),
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, { payload }: PayloadAction<Login>) => {
      if (payload.token) {
        localStorage.setItem(TOKEN, payload.token);
        SetAuthToken(payload.token);
      }
      state.user = payload.user;
      state.isAuth = true;
    },
    logout: (state) => {
      state.isAuth = false;
      state.user = null;
      localStorage.removeItem(TOKEN);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (payload) {
        state.user = payload;
      }
      state.isAuth = true;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.loading = false;
      state.isAuth = false;
      state.user = null;
      localStorage.removeItem(TOKEN);
    });
  },
});

export const { login, logout } = UserSlice.actions;

export default UserSlice.reducer;

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, thunkApi) => {
    const token = localStorage.getItem(TOKEN);
    if (!token) {
      return thunkApi.rejectWithValue("No token");
    }
    SetDefaultHeaders();
    SetAuthToken(token);
    try {
      const res = await axios.get("/user");
      const userData = (res.data as { data: User }).data;
      return userData;
    } catch (error) {
      const err = error as ApiError;
      return thunkApi.rejectWithValue(err);
    }
  },
);
