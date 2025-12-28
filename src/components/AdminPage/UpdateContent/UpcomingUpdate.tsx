// src/components/updates/upcoming-updates.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, ImageIcon, UploadCloud } from "lucide-react";
import { FiUpload, FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateUpcomingUpdateMutation,
  useDeleteUpcomingUpdateMutation,
  useGetUpcomingUpdatesQuery,
  useUpdateUpcomingUpdateMutation,
} from "@/redux/features/auth/updatesApi";
import { UpcomingUpdate } from "@/redux/types/venue.type";
import PageLoader from "../Shared/PageLoader";

type UpdateFormValues = {
  title: string;
  description: string;
  releaseDate: Date;
  contentType: "video" | "course";
};

export function UpcomingUpdates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUpdateId, setCurrentUpdateId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: updates, isLoading, isError } = useGetUpcomingUpdatesQuery();
  const [createUpdate] = useCreateUpcomingUpdateMutation();
  const [updateUpdate] = useUpdateUpcomingUpdateMutation();
  const [deleteUpdate] = useDeleteUpcomingUpdateMutation();

  const form = useForm<UpdateFormValues>({
    defaultValues: {
      title: "",
      description: "",
      releaseDate: new Date(),
      contentType: "video",
    },
  });

  const handleEditClick = (update: UpcomingUpdate) => {
    setIsEditMode(true);
    setCurrentUpdateId(update.id);
    form.reset({
      title: update.title,
      description: update.description,
      releaseDate: new Date(update.releaseDate),
      contentType: update.contentType,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this update?")) {
      try {
        await deleteUpdate(id).unwrap();
        toast.success("Update deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete update.");
        console.error("Delete update error:", error);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentUpdateId(null);
    form.reset();
    setFile(null);
  };

  async function onSubmit(data: UpdateFormValues) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("releaseDate", data.releaseDate.toISOString());
    formData.append("contentType", data.contentType);
    if (file) {
      formData.append("bannerImage", file);
    }

    try {
      if (isEditMode && currentUpdateId) {
        await updateUpdate({ id: currentUpdateId, formData }).unwrap();
        toast.success("Update updated successfully.");
      } else {
        await createUpdate(formData).unwrap();
        toast.success("Update created successfully.");
      }
      handleDialogClose();
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} update.`);
      console.error("Error:", error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upcoming Updates</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer">
              <FiUpload className="h-4 w-4" />
              Add New Update
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200">
            <DialogHeader className="border-b border-gray-100 pb-3">
              <DialogTitle className="text-lg font-semibold text-gray-800">
                {isEditMode ? "Edit Update" : "Create New Update"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-2"
                encType="multipart/form-data"
              >
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Update title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Update description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Release Date & Content Type */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Release Date */}
                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Release Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content Type */}
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="course">Course</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Banner Image */}
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <label
                    htmlFor="bannerImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    {file ? (
                      <span className="text-sm text-gray-500">{file.name}</span>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {isEditMode && "Leave empty to keep current image"}
                        </p>
                      </>
                    )}
                    <input
                      id="bannerImage"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </FormItem>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 ">
                  <Button
                    className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isEditMode ? "Update" : "Create"} Update
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Updates Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {/* {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))} */}
              <PageLoader />
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">
              Failed to load updates
            </div>
          ) : (
            <Table className="border border-gray-200 rounded-md">
              <TableCaption className="text-gray-500">
                A list of upcoming updates.
              </TableCaption>
              <TableHeader className="bg-gray-100 border-b border-gray-300 rounded-t-md">
                <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                  <TableHead className="px-4 py-3">Banner</TableHead>
                  <TableHead className="px-4 py-3">Title</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Release Date</TableHead>
                  <TableHead className="px-4 py-3">Content Type</TableHead>
                  <TableHead className="px-4 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates?.length ? (
                  updates.map((update: UpcomingUpdate) => (
                    <TableRow
                      key={update.id}
                      className="hover:bg-accent/50 transition"
                    >
                      <TableCell>
                        {update.bannerImage ? (
                          <img
                            src={update.bannerImage}
                            alt={update.title}
                            className="h-12 w-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100 border">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {update.title}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-gray-600">
                        {update.description}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(update.releaseDate), "PP")}
                      </TableCell>
                      <TableCell className="capitalize text-gray-600">
                        {update.contentType}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:bg-green-100 cursor-pointer"
                            onClick={() => handleEditClick(update)}
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-100 cursor-pointer"
                            onClick={() => handleDeleteClick(update.id)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No updates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// // src/components/updates/upcoming-updates.tsx
// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { format } from "date-fns";
// import { CalendarIcon, ImageIcon, UploadCloud } from "lucide-react";
// import { FiUpload, FiEdit, FiTrash2 } from "react-icons/fi";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// import {
//   useCreateUpcomingUpdateMutation,
//   useGetUpcomingUpdatesQuery,
// } from "@/redux/features/auth/updatesApi";
// import { UpcomingUpdate } from "@/redux/types/venue.type";

// type UpdateFormValues = {
//   title: string;
//   description: string;
//   releaseDate: Date;
//   contentType: "video" | "course";
// };

// export function UpcomingUpdates() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [file, setFile] = useState<File | null>(null);

//   const { data: updates, isLoading, isError } = useGetUpcomingUpdatesQuery();
//   const [createUpdate] = useCreateUpcomingUpdateMutation();

//   const form = useForm<UpdateFormValues>({
//     defaultValues: {
//       title: "",
//       description: "",
//       releaseDate: new Date(),
//       contentType: "video",
//     },
//   });

//   async function onSubmit(data: UpdateFormValues) {
//     const formData = new FormData();
//     formData.append("title", data.title);
//     formData.append("description", data.description);
//     formData.append("releaseDate", data.releaseDate.toISOString());
//     formData.append("contentType", data.contentType);
//     if (file) {
//       formData.append("bannerImage", file);
//     }

//     try {
//       await createUpdate(formData).unwrap();
//       toast.success("Update created successfully.");
//       setIsDialogOpen(false);
//       form.reset();
//       setFile(null);
//     } catch (error) {
//       toast.error("Failed to create update.");
//       console.error("Create update error:", error);
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Upcoming Updates</h1>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
//               <FiUpload className="h-4 w-4" />
//               Add New Update
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="sm:max-w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200">
//             <DialogHeader className="border-b border-gray-100 pb-3">
//               <DialogTitle className="text-lg font-semibold text-gray-800">
//                 Create New Update
//               </DialogTitle>
//             </DialogHeader>

//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-4 py-2"
//                 encType="multipart/form-data"
//               >
//                 {/* Title */}
//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Title</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Update title" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Description */}
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder="Update description"
//                           className="min-h-[100px]"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Release Date & Content Type */}
//                 <div className="grid grid-cols-2 gap-4">
//                   {/* Release Date */}
//                   <FormField
//                     control={form.control}
//                     name="releaseDate"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-col">
//                         <FormLabel>Release Date</FormLabel>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <FormControl>
//                               <Button
//                                 variant="outline"
//                                 className={cn(
//                                   "w-full pl-3 text-left font-normal",
//                                   !field.value && "text-muted-foreground"
//                                 )}
//                               >
//                                 {field.value
//                                   ? format(field.value, "PPP")
//                                   : "Pick a date"}
//                                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                               </Button>
//                             </FormControl>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0" align="start">
//                             <Calendar
//                               mode="single"
//                               selected={field.value}
//                               onSelect={field.onChange}
//                               disabled={(date) => date < new Date()}
//                               initialFocus
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   {/* Content Type */}
//                   <FormField
//                     control={form.control}
//                     name="contentType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Content Type</FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select content type" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="video">Video</SelectItem>
//                             <SelectItem value="course">Course</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 {/* Banner Image */}
//                 <FormItem>
//                   <FormLabel>Banner Image</FormLabel>
//                   <label
//                     htmlFor="bannerImage"
//                     className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition"
//                   >
//                     {file ? (
//                       <span className="text-sm text-gray-500">{file.name}</span>
//                     ) : (
//                       <>
//                         <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
//                         <p className="text-sm text-gray-400">
//                           Click to upload or drag and drop
//                         </p>
//                       </>
//                     )}
//                     <input
//                       id="bannerImage"
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                     />
//                   </label>
//                 </FormItem>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-2 pt-3">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" className="bg-[var(--color-blueOne)]">
//                     Create Update
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Updates Table */}
//       <Card>
//         <CardContent className="p-0">
//           {isLoading ? (
//             <div className="space-y-4 p-6">
//               {[...Array(3)].map((_, i) => (
//                 <Skeleton key={i} className="h-16 w-full" />
//               ))}
//             </div>
//           ) : isError ? (
//             <div className="p-6 text-center text-destructive">
//               Failed to load updates
//             </div>
//           ) : (
//             <Table className="border border-gray-200 rounded-md">
//               <TableCaption className="text-gray-500">
//                 A list of upcoming updates.
//               </TableCaption>
//               <TableHeader className="bg-gray-100 border-b border-gray-300 rounded-t-md">
//                 <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
//                   <TableHead className="px-4 py-3">Banner</TableHead>
//                   <TableHead className="px-4 py-3">Title</TableHead>
//                   <TableHead className="px-4 py-3">Description</TableHead>
//                   <TableHead className="px-4 py-3">Release Date</TableHead>
//                   <TableHead className="px-4 py-3">Content Type</TableHead>
//                   <TableHead className="px-4 py-3 text-right">
//                     Actions
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {updates?.length ? (
//                   updates.map((update: UpcomingUpdate) => (
//                     <TableRow
//                       key={update.id}
//                       className="hover:bg-accent/50 transition"
//                     >
//                       <TableCell>
//                         {update.bannerImage ? (
//                           <img
//                             src={update.bannerImage}
//                             alt={update.title}
//                             className="h-12 w-20 object-cover rounded border"
//                           />
//                         ) : (
//                           <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100 border">
//                             <ImageIcon className="h-4 w-4 text-gray-400" />
//                           </div>
//                         )}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {update.title}
//                       </TableCell>
//                       <TableCell className="max-w-[250px] truncate text-gray-600">
//                         {update.description}
//                       </TableCell>
//                       <TableCell className="text-gray-600">
//                         {format(new Date(update.releaseDate), "PP")}
//                       </TableCell>
//                       <TableCell className="capitalize text-gray-600">
//                         {update.contentType}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end items-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-green-500 hover:bg-green-100"
//                           >
//                             <FiEdit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-red-500 hover:bg-red-100"
//                           >
//                             <FiTrash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center h-24">
//                       No updates found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
