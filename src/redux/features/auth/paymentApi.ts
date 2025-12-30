// src/redux/features/auth/paymentApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { SubscriptionsResponse, SubscriptionStatusFilter } from "@/redux/types/venue.type";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<SubscriptionsResponse, SubscriptionStatusFilter>({
      query: (status = "all") => ({
        url: `/subscription-plans/subscriptions/all?status=${status}`,
        method: "GET",
      }),
      providesTags: ["Payment"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPaymentsQuery } = paymentApi;
