import { baseApi } from "@/redux/hooks/baseApi";
import { Venue } from "@/redux/types/venue.type";

const venueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVenues: builder.query<Venue[], void>({
      query: () => ({
        url: "/venue/filter",
        method: "GET",
      }),
    }),
    createVenue: builder.mutation<Venue, Partial<Venue>>({
      query: (newVenue) => ({
        url: "venues",
        method: "POST",
        body: newVenue,
      }),
    }),
  }),
});

export const { useGetAllVenuesQuery, useCreateVenueMutation } = venueApi;
