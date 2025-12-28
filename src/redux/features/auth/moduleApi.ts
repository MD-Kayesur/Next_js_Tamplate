import { baseApi } from "@/redux/hooks/baseApi";
import { IModule } from "@/redux/types/venue.type";

export const moduleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create a new module
    getModuleById: build.query<IModule, string>({
      query: (id) => `/modules/${id}`,
      providesTags: (result, error, id) => [{ type: "Module", id }],
    }),

    createModule: build.mutation<IModule, Partial<IModule>>({
      query: (moduleData) => ({
        url: "/modules",
        method: "POST",
        body: moduleData,
      }),
      invalidatesTags: ["Module"],
    }),

    // Get all modules for a course
    getModulesByCourse: build.query<IModule[], string>({
      query: (courseId) => `/modules/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: "Module", id: courseId },
      ],
    }),

    // Update a module
    updateModule: build.mutation<
      IModule,
      { id: string; data: Partial<IModule> }
    >({
      query: ({ id, data }) => ({
        url: `/modules/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Module", id }],
    }),

    // Delete a module
    deleteModule: build.mutation<void, string>({
      query: (id) => ({
        url: `/modules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Module", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetModuleByIdQuery,
  useCreateModuleMutation,
  useGetModulesByCourseQuery,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} = moduleApi;
