// src/redux/features/venue/venueApi.ts
import { baseApi } from "@/redux/hooks/baseApi";
import { Venue } from "@/redux/types/venue.type";

const venueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVenues: builder.query<Venue[], { status?: string }>({
      query: (params) => ({
        url: `/admin/venue/all`,
        method: "GET",
        params: params,
      }),
      transformResponse: (response: { data: { venues: Venue[] } }) =>
        response.data.venues,
    }),
    createVenue: builder.mutation<Venue, Partial<Venue>>({
      query: (newVenue) => ({
        url: "/admin/venue",
        method: "POST",
        body: newVenue,
      }),
    }),
  }),
});

export const { useGetAllVenuesQuery, useCreateVenueMutation } = venueApi;
