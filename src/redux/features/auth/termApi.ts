import { baseApi } from "@/redux/hooks/baseApi";
import {
  TermCategory,
  KeyPoint,
  CreateTermCategoryPayload,
  CreateKeyPointPayload,
} from "@/redux/types/venue.type";

export const termApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all term categories
    getTermCategories: builder.query<TermCategory[], void>({
      query: () => "/terms/categories",
      providesTags: ["TermCategory"],
      transformResponse: (response: TermCategory[]) => {
        return response.map((category) => ({
          ...category,
          lastUpdated: category.lastUpdated || new Date().toISOString(),
        }));
      },
    }),

    // Create a new term category
    createTermCategory: builder.mutation<
      TermCategory,
      CreateTermCategoryPayload
    >({
      query: (payload) => ({
        url: "/terms/category",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["TermCategory"],
    }),

    // Delete a term category
    deleteTermCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/terms/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TermCategory"],
    }),

    // Get key points for a specific category
    getKeyPointsByCategory: builder.query<KeyPoint[], string>({
      query: (categoryId) => `/terms/category/${categoryId}/key-points`,
      providesTags: (result, error, categoryId) => [
        { type: "KeyPoint", id: categoryId },
      ],
    }),

    // Create a new key point
    createKeyPoint: builder.mutation<KeyPoint, CreateKeyPointPayload>({
      query: (payload) => ({
        url: "/terms/key-point",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result) => [
        { type: "KeyPoint", id: result?.categoryId },
        "TermCategory",
      ],
    }),

    // Delete a key point
    deleteKeyPoint: builder.mutation<void, string>({
      query: (id) => ({
        url: `/terms/key-point/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "KeyPoint", id: arg },
        "TermCategory",
      ],
    }),
  }),
});

export const {
  useGetTermCategoriesQuery,
  useCreateTermCategoryMutation,
  useDeleteTermCategoryMutation,
  useGetKeyPointsByCategoryQuery,
  useCreateKeyPointMutation,
  useDeleteKeyPointMutation,
} = termApi;
