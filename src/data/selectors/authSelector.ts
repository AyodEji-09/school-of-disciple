import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const auth = (state: RootState) => state.user;

export const selectAuth = createSelector([auth], (authSlice) => authSlice.isAuth);

export const selectUser = createSelector([auth], (user) => user.user);
export const selectLoading = createSelector([auth], (loading) => loading.loading);

