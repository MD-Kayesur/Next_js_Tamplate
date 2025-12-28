// src/redux/features/auth/videoApi.ts
import { baseApi } from "@/redux/hooks/baseApi";

export const videoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Upload video
    uploadVideo: build.mutation({
      query: (formData) => ({
        url: "/videos",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Video"],
    }),

    // Get all videos
    getVideos: build.query({
      query: ({ limit = 10, page = 1 }) => ({
        url: `/videos?limit=${limit}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["Video"],
    }),

    // Search videos
    searchVideos: build.query({
      query: (query) => ({
        url: `/videos/search?query=${query}`,
        method: "GET",
      }),
      providesTags: ["Video"],
    }),

    // Delete video
    deleteVideo: build.mutation({
      query: (id) => ({
        url: `/videos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
    }),

    // Update video
    updateVideo: build.mutation({
      query: ({ id, formData }) => ({
        url: `/videos/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Video"],
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useGetVideosQuery,
  useSearchVideosQuery,
  useDeleteVideoMutation,
  useUpdateVideoMutation,
} = videoApi;

// // src/redux/features/video/videoApi.ts
// import { baseApi } from "@/redux/hooks/baseApi";

// export const videoApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     // Upload video
//     uploadVideo: build.mutation({
//       query: (formData) => ({
//         url: "/videos",
//         method: "POST",
//         body: formData,
//       }),
//       invalidatesTags: ["Video"],
//     }),

//     // Get all videos
//     getVideos: build.query({
//       query: ({ limit = 10, page = 1 }) => ({
//         url: `/videos?limit=${limit}&page=${page}`,
//         method: "GET",
//       }),
//       providesTags: ["Video"],
//     }),

//     // Search videos
//     searchVideos: build.query({
//       query: (query) => ({
//         url: `/videos/search?query=${query}&limit=10&page=1`,
//         method: "GET",
//       }),
//       providesTags: ["Video"],
//     }),

//     // Delete video
//     deleteVideo: build.mutation({
//       query: (id) => ({
//         url: `/videos/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Video"],
//     }),

//     // Update video
//     updateVideo: build.mutation({
//       query: ({ id, formData }) => ({
//         url: `/videos/${id}`,
//         method: "PATCH",
//         body: formData,
//       }),
//       invalidatesTags: ["Video"],
//     }),
//   }),
// });

// export const {
//   useUploadVideoMutation,
//   useGetVideosQuery,
//   useSearchVideosQuery,
//   useDeleteVideoMutation,
//   useUpdateVideoMutation,
// } = videoApi;
