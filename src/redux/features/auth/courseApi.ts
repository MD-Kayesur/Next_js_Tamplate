import { Course } from "@/redux/types/venue.type";
import { baseApi } from "../../hooks/baseApi";

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => "/courses",
      transformResponse: (response: any) => {
        // Ensure we always return an array of Course type
        if (Array.isArray(response)) {
          return response as Course[];
        }
        // Handle case where response might be { data: Course[] }
        if (response?.data && Array.isArray(response.data)) {
          return response.data as Course[];
        }
        console.warn("Unexpected courses response format:", response);
        return []; // Return empty array as fallback
      },
      providesTags: (result) => {
        // Type guard to ensure result is an array
        const courses = Array.isArray(result) ? result : [];
        return [
          ...courses.map(({ id }) => ({ type: "Course" as const, id })),
          { type: "Course", id: "LIST" },
        ];
      },
    }),
    getCourseById: builder.query<Course, string>({
      query: (id) => `/courses/${id}`,
      transformResponse: (response: any) => {
        // Ensure we get a single course object
        return response?.data ? response.data : response;
      },
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    createCourse: builder.mutation<Course, FormData>({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),
    updateCourse: builder.mutation<Course, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/courses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;

// import { Course } from "@/redux/types/venue.type";
// import { baseApi } from "../../hooks/baseApi";

// export const courseApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getCourses: builder.query<Course[], void>({
//       query: () => "/courses",
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "Course" as const, id })),
//               { type: "Course", id: "LIST" },
//             ]
//           : [{ type: "Course", id: "LIST" }],
//     }),
//     getCourseById: builder.query<Course, string>({
//       query: (id) => `/courses/${id}`,
//       providesTags: (result, error, id) => [{ type: "Course", id }],
//     }),
//     createCourse: builder.mutation<Course, FormData>({
//       query: (courseData) => ({
//         url: "/courses",
//         method: "POST",
//         body: courseData,
//       }),
//       invalidatesTags: [{ type: "Course", id: "LIST" }],
//     }),

//     // src/redux/features/course/courseApi.ts
//     updateCourse: builder.mutation<Course, { id: string; body: FormData }>({
//       query: ({ id, body }) => {
//         return {
//           url: `/courses/${id}`,
//           method: "PATCH",
//           body,
//           // Remove the Content-Type header - let the browser set it automatically
//           // with the proper boundary
//         };
//       },
//       invalidatesTags: (result, error, { id }) => [
//         { type: "Course", id },
//         { type: "Course", id: "LIST" },
//       ],
//     }),

//     deleteCourse: builder.mutation<void, string>({
//       query: (id) => ({
//         url: `/courses/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: "Course", id },
//         { type: "Course", id: "LIST" },
//       ],
//     }),
//   }),
// });

// export const {
//   useGetCoursesQuery,
//   useGetCourseByIdQuery,
//   useCreateCourseMutation,
//   useUpdateCourseMutation,
//   useDeleteCourseMutation,
// } = courseApi;
