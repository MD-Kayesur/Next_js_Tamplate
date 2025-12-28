import { baseApi } from "@/redux/hooks/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery } = userApi;
