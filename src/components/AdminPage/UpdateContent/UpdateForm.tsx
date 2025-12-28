// // src/components/UpdateForm.tsx
// import { CreateUpdateDto, UpcomingUpdate } from "@/redux/types/venue.type";
// import React from "react";
// import { useForm } from "react-hook-form";

// interface UpdateFormProps {
//   onSubmit: (data: CreateUpdateDto) => void;
//   onClose: () => void;
//   isLoading: boolean;
//   initialData?: UpcomingUpdate;
// }

// const UpdateForm: React.FC<UpdateFormProps> = ({
//   onSubmit,
//   onClose,
//   isLoading,
//   initialData,
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<CreateUpdateDto>({
//     defaultValues: initialData || {
//       isPublished: false,
//     },
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <div>
//         <label>Title</label>
//         <input
//           {...register("title", { required: "Title is required" })}
//           disabled={isLoading}
//         />
//         {errors.title && <span>{errors.title.message}</span>}
//       </div>

//       <div>
//         <label>Description</label>
//         <textarea
//           {...register("description", { required: "Description is required" })}
//           disabled={isLoading}
//         />
//         {errors.description && <span>{errors.description.message}</span>}
//       </div>

//       <div>
//         <label>Release Date</label>
//         <input
//           type="date"
//           {...register("releaseDate", { required: "Release date is required" })}
//           disabled={isLoading}
//         />
//         {errors.releaseDate && <span>{errors.releaseDate.message}</span>}
//       </div>

//       <div>
//         <label>
//           <input
//             type="checkbox"
//             {...register("isPublished")}
//             disabled={isLoading}
//           />
//           Published
//         </label>
//       </div>

//       <button type="submit" disabled={isLoading}>
//         {isLoading ? "Saving..." : "Save"}
//       </button>
//       <button type="button" onClick={onClose} disabled={isLoading}>
//         Cancel
//       </button>
//     </form>
//   );
// };

// export default UpdateForm;
