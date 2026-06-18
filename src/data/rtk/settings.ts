import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export interface GlobalSettings {
  _id: string;
  registrationFee: number;
  manualOrderFee: number;
  zelleEmail?: string;
  zelleName?: string;
  manualOrderZelleEmail?: string;
  manualOrderZelleName?: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  tagTypes: ["Settings"],
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  endpoints: (builder) => ({
    getSettings: builder.query<ApiResponseN<GlobalSettings>, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<
      ApiResponseN<GlobalSettings>,
      { registrationFee?: number; manualOrderFee?: number; zelleEmail?: string; zelleName?: string; manualOrderZelleEmail?: string; manualOrderZelleName?: string }
    >({
      query: (body) => ({
        url: "/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
