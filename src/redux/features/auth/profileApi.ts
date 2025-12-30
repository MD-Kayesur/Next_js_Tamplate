import { baseApi } from "@/redux/hooks/baseApi";
import { IProfile, ProfileUpdatePayload } from "@/redux/types/venue.type";

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<IProfile, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
      transformResponse: (response: any) => {
        // Map API response to IProfile structure
        return {
          id: response.userId || response.id,
          fullName: response.fullName,
          email: response.email,
          phoneNumber: response.phone || response.phoneNumber || "",
          photo: response.profilePictureUrl || response.photo || null,
          role: response.role,
          isSubscribed: response.currentSubscription !== null,
          subscriptions: [],
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        };
      },
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
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } = profileApi;
