// src/redux/features/auth/contentApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Content } from "@/redux/types/venue.type";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentsByModule: builder.query<Content[], string>({
      query: (moduleId) => ({
        url: `contents/module/${moduleId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Content" as const, id })),
              { type: "Content", id: "LIST" },
            ]
          : [{ type: "Content", id: "LIST" }],
    }),

    getAllContents: builder.query<Content[], void>({
      query: () => ({
        url: "contents",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Content" as const, id })),
              { type: "Content", id: "LIST" },
            ]
          : [{ type: "Content", id: "LIST" }],
    }),

    getContentById: builder.query<Content, string>({
      query: (contentId) => ({
        url: `contents/${contentId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Content", id }],
    }),

    createContent: builder.mutation<Content, FormData>({
      query: (formData) => ({
        url: "contents",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Content", id: "LIST" }],
    }),

    updateContent: builder.mutation<
      Content,
      { id: string; updates: Partial<Content> }
    >({
      query: ({ id, updates }) => ({
        url: `contents/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Content", id: arg.id },
        { type: "Content", id: "LIST" },
      ],
    }),

    updateContentView: builder.mutation<Content, string>({
      query: (contentId) => ({
        url: `contents/${contentId}/view`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Content", id }],
    }),

    deleteContent: builder.mutation<void, { id: string; moduleId: string }>({
      query: ({ id }) => ({
        url: `contents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Content", id: arg.id },
        { type: "Content", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContentsByModuleQuery,
  useGetAllContentsQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useUpdateContentViewMutation,
} = contentApi;
