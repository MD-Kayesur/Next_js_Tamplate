// src/redux/features/auth/notificationApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Notification } from "@/redux/types/venue.type";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<Notification[], void>({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      providesTags: ["Notification"],
      transformResponse: (response: Notification[]) => response,
    }),
    createNotification: build.mutation<
      Notification,
      Omit<Notification, "id" | "isRead" | "createdAt">
    >({
      query: (data) => ({
        url: "/notifications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),
    markNotificationAsRead: build.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationAsReadMutation,
} = notificationApi;
