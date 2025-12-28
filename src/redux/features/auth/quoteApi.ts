// src/redux/apis/quoteApi.ts

import { baseApi } from "@/redux/hooks/baseApi";
import { Quote } from "@/type/quotes";

export const quoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotes: builder.query<Quote[], void>({
      query: () => "/quotes",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Quote" as const, id })),
              "Quote",
            ]
          : ["Quote"],
    }),
    addQuote: builder.mutation<Quote, Omit<Quote, "id" | "createdAt">>({
      query: (body) => ({
        url: "/quotes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quote"],
    }),
    deleteQuote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quotes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Quote", id }],
    }),
  }),
});

export const {
  useGetQuotesQuery,
  useAddQuoteMutation,
  useDeleteQuoteMutation,
} = quoteApi;
