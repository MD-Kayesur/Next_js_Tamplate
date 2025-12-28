// src/redux/features/auth/faqApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { FAQ, FAQCategory } from "@/redux/types/venue.type";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // FAQ Endpoints
    getFaqs: builder.query<FAQ[], void>({
      query: () => "/faq",
      providesTags: ["FAQ"],
    }),
    getFaqById: builder.query<FAQ, string>({
      query: (id) => `/faq/${id}`,
      providesTags: (result, error, id) => [{ type: "FAQ", id }],
    }),
    createFaq: builder.mutation<
      FAQ,
      Omit<FAQ, "id" | "createdAt" | "updatedAt">
    >({
      query: (faq) => ({
        url: "/faq",
        method: "POST",
        body: faq,
      }),
      invalidatesTags: ["FAQ"],
    }),
    updateFaq: builder.mutation<FAQ, { id: string; data: Partial<FAQ> }>({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "FAQ", id }],
    }),
    deleteFaq: builder.mutation<void, string>({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),

    // FAQ Category Endpoints
    getFaqCategories: builder.query<FAQCategory[], void>({
      query: () => "/faq/categories",
      providesTags: ["FAQCategory"],
    }),
    getFaqsByCategory: builder.query<FAQ[], string>({
      query: (categoryId) => `/faq/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "FAQ", id: categoryId },
      ],
    }),
    createFaqCategory: builder.mutation<FAQCategory, { name: string }>({
      query: (category) => ({
        url: "/faq/category",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["FAQCategory"],
    }),
    deleteFaqCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/faq/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQCategory"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqCategoriesQuery,
  useGetFaqsByCategoryQuery,
  useCreateFaqCategoryMutation,
  useDeleteFaqCategoryMutation,
} = faqApi;
