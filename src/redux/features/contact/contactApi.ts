// redux/features/contact/contactApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import {
  WhatsAppContact,
  PhoneContact,
  EmailContact,
  CreateWhatsAppRequest,
  CreatePhoneRequest,
  CreateEmailRequest,
} from "./contact.type";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // WhatsApp Endpoints
    createWhatsApp: builder.mutation<WhatsAppContact, CreateWhatsAppRequest>({
      query: (data) => ({
        url: "/whatsapp",
        method: "POST",
        body: data,
      }),
    }),

    getAllWhatsApp: builder.query<WhatsAppContact, void>({
      query: () => "/whatsapp",
    }),

    // Phone Endpoints
    createPhone: builder.mutation<PhoneContact, CreatePhoneRequest>({
      query: (data) => ({
        url: "/phone",
        method: "POST",
        body: data,
      }),
    }),

    getAllPhones: builder.query<PhoneContact, void>({
      query: () => "/phone",
    }),

    // Email Endpoints
    createEmail: builder.mutation<EmailContact, CreateEmailRequest>({
      query: (data) => ({
        url: "/email",
        method: "POST",
        body: data,
      }),
    }),

    getAllEmails: builder.query<EmailContact, void>({
      query: () => "/email",
    }),
  }),
});

// Export hooks for usage in components
export const {
  // WhatsApp hooks
  useCreateWhatsAppMutation,
  useGetAllWhatsAppQuery,

  // Phone hooks
  useCreatePhoneMutation,
  useGetAllPhonesQuery,

  // Email hooks
  useCreateEmailMutation,
  useGetAllEmailsQuery,
} = contactApi;