import { baseApi } from "@/redux/hooks/baseApi";
import { IProfile, ProfileUpdatePayload } from "@/redux/types/venue.type";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<IProfile, void>({
      query: () => "/user/me",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<IProfile, ProfileUpdatePayload>({
      query: (body) => {
        const formData = new FormData();

        if (body.fullName) formData.append("fullName", body.fullName);
        if (body.phoneNumber) formData.append("phoneNumber", body.phoneNumber);
        if (body.file) formData.append("file", body.file);

        return {
          url: "/user/me",
          method: "PATCH",
          body: formData,
          // Content-Type will be automatically set by the browser with boundary
        };
      },
      invalidatesTags: ["User"],
      // Optionally add transformResponse to handle the response
      transformResponse: (response: { data: IProfile }) => response.data,
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
