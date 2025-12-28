// // src/components/UpdatesList.tsx
// import React from "react";

// import { CreateUpdateDto } from "@/redux/types/venue.type";
// import {
//   useCreateUpcomingUpdateMutation,
//   useGetUpcomingUpdatesQuery,
// } from "@/redux/features/auth/updatesApi";

// const UpdatesList: React.FC = () => {
//   const { updates, isLoading, isError, openDialog, closeDialog } =
//     useGetUpcomingUpdatesQuery();

//   const [createUpdate, { isLoading: isCreating }] =
//     useCreateUpcomingUpdateMutation();

//   const handleSubmit = async (data: CreateUpdateDto) => {
//     try {
//       await createUpdate(data).unwrap();
//       closeDialog();
//     } catch (error) {
//       console.error("Failed to create update:", error);
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error loading updates</div>;

//   return (
//     <div>
//       <button onClick={() => openDialog()}>Create New Update</button>

//       <div>
//         {updates?.map((update) => (
//           <div key={update.id}>
//             <h3>{update.title}</h3>
//             <p>{update.description}</p>
//             <button onClick={() => openDialog(update)}>Edit</button>
//           </div>
//         ))}
//       </div>

//       <UpdateForm
//         onSubmit={handleSubmit}
//         onClose={closeDialog}
//         isLoading={isCreating}
//       />
//     </div>
//   );
// };

// export default UpdatesList;
