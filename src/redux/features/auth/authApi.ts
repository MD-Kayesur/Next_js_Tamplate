import { baseApi } from "@/redux/hooks/baseApi";
import { LoginResponse } from "@/redux/types/venue.type";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (userInfo) => ({
          url: "auth/login",
          method: "POST",
          body: userInfo,
        }),
      }
    ),
  }),
});

export const { useLoginMutation } = authApi;

// import { baseApi } from "@/redux/hooks/baseApi";

// const autApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (userInfo) => ({
//         url: "auth/login",
//         method: "POST",
//         body: userInfo,
//       }),
//     }),
//   }),
// });

// export const { useLoginMutation } = autApi;
