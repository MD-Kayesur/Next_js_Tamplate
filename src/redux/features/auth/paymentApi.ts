// src/redux/features/auth/paymentApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import {
  SubscriptionsResponse,
  SubscriptionStatusFilter,
  SubscriptionGraphResponse,
} from "@/redux/types/venue.type";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<SubscriptionsResponse, SubscriptionStatusFilter>({
      query: (status = "all") => ({
        url: `/subscription-plans/subscriptions/all?status=${status}`,
        method: "GET",
      }),
      providesTags: ["Payment"],
    }),

    getSubscriptionGraph: builder.query<SubscriptionGraphResponse, { period?: "daily" | "weekly" | "monthly" | "yearly"; startDate?: string; endDate?: string }>(
      {
        query: ({ period = "weekly", startDate, endDate } = {}) => {
          const params = new URLSearchParams();
          if (period) params.set("period", period);
          if (startDate) params.set("startDate", startDate);
          if (endDate) params.set("endDate", endDate);

          return {
            url: `/subscription-plans/subscriptions/graph-data?${params.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["Payment"],
      }
    ),

  }),
  overrideExisting: false,
});

export const { useGetPaymentsQuery, useGetSubscriptionGraphQuery } = paymentApi;
