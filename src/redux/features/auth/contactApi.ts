// src/redux/features/auth/contactApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Message } from "@/redux/types/venue.type";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<Message[], void>({
      query: () => "/contact",
      providesTags: ["Message"],
    }),
    getContactMessageById: builder.query<Message, string>({
      query: (id) => `/contact/${id}`,
      providesTags: (result, error, id) => [{ type: "Message", id }],
    }),
    createContactMessage: builder.mutation<Message, Partial<Message>>({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Message"],
    }),
    deleteContactMessage: builder.mutation<Message, string>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message"],
    }),
    updateMessageReadStatus: builder.mutation<
      Message,
      { id: string; read: boolean }
    >({
      query: ({ id, read }) => ({
        url: `/contact/${id}/read`,
        method: "PATCH",
        body: { read },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Message", id },
        "Message",
      ],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useCreateContactMessageMutation,
  useDeleteContactMessageMutation,
  useUpdateMessageReadStatusMutation,
} = contactApi;
