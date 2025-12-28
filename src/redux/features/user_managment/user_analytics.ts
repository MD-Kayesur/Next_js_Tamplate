import { baseApi } from "@/redux/hooks/baseApi";
type UserAnalyticsData = {
  role: string;
  count: number;
};

const user_analytics = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userAnalyticsForBarCharts: builder.query<UserAnalyticsData[], void>({
      query: () => ({
        url: "analytics/user-role-analytics",
        method: "GET",
      }),
    }),
  }),
});

export const { useUserAnalyticsForBarChartsQuery } = user_analytics;
