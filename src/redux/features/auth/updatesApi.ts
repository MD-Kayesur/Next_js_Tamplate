// src/redux/features/auth/updatesApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { UpcomingUpdate } from "@/redux/types/venue.type";

export const updatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUpcomingUpdates: builder.query<UpcomingUpdate[], void>({
      query: () => "/updates/upcoming-updates",
      providesTags: ["UpcomingUpdate"],
    }),
    createUpcomingUpdate: builder.mutation<UpcomingUpdate, FormData>({
      query: (formData) => ({
        url: "/updates/upcoming-updates",
        method: "POST",
        body: formData,
        headers: {
          // Let the browser set the content type with boundary
          // for multipart/form-data
        },
      }),
      invalidatesTags: ["UpcomingUpdate"],
    }),
    updateUpcomingUpdate: builder.mutation<
      UpcomingUpdate,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/updates/upcoming-updates/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["UpcomingUpdate"],
    }),
    deleteUpcomingUpdate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/updates/upcoming-updates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UpcomingUpdate"],
    }),
  }),
});

export const {
  useGetUpcomingUpdatesQuery,
  useCreateUpcomingUpdateMutation,
  useUpdateUpcomingUpdateMutation,
  useDeleteUpcomingUpdateMutation,
} = updatesApi;

// import { baseApi } from "@/redux/hooks/baseApi";
// import { UpcomingUpdate } from "@/redux/types/venue.type";

// export const updatesApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getUpcomingUpdates: builder.query<UpcomingUpdate[], void>({
//       query: () => "/updates/upcoming-updates",
//       providesTags: ["UpcomingUpdate"],
//     }),
//     createUpcomingUpdate: builder.mutation<UpcomingUpdate, FormData>({
//       query: (formData) => ({
//         url: "/updates/upcoming-updates",
//         method: "POST",
//         body: formData,
//         headers: {
//           // Let the browser set the content type with boundary
//           // for multipart/form-data
//         },
//       }),
//       invalidatesTags: ["UpcomingUpdate"],
//     }),
//   }),
// });

// export const { useGetUpcomingUpdatesQuery, useCreateUpcomingUpdateMutation } =
//   updatesApi;
