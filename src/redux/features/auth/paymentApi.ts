// src/redux/features/auth/paymentApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Payment } from "@/redux/types/venue.type";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], void>({
      query: () => ({
        url: "/subscriptions/payments",
        method: "GET",
      }),
      providesTags: ["Payment"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPaymentsQuery } = paymentApi;
