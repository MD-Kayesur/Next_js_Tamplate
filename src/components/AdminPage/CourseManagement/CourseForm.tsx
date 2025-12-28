// src/app/admin/course-management/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useCreateCourseMutation } from "@/redux/features/auth/courseApi";

export const CourseForm = () => {
  const router = useRouter();
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isPaid: false,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("isPaid", String(formData.isPaid));
    formDataToSend.append("category", formData.category);
    if (thumbnail) {
      formDataToSend.append("thumbnail", thumbnail);
    }

    try {
      await createCourse(formDataToSend).unwrap();
      toast.success("Course created successfully!");
      router.push("/admin/course-management");
    } catch (error) {
      toast.error("Failed to create course");
      console.error(error);
    }
  };

  return (
    <div className="full mx-auto ">
      <Button
        variant="outline"
        size="sm"
        className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 mb-6 cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Course</CardTitle>
          <CardDescription>
            Fill in the form to create a new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Course title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Comma separated categories"
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Paid Course</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to mark this as a paid course
                  </p>
                </div>
                <Switch
                  className="cursor-pointer"
                  checked={formData.isPaid}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPaid: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[110px]"
                placeholder="Detailed course description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={handleFileChange}
                required
              />
              {thumbnail && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="rounded-md overflow-hidden border w-48">
                    <Image
                      width={192}
                      height={108}
                      style={{ objectFit: "cover" }}
                      src={URL.createObjectURL(thumbnail)}
                      alt="Thumbnail preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            <CardFooter className="flex justify-end px-0 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import Image from "next/image";

// interface CourseFormProps {
//   initialData?: {
//     _id: string;
//     title: string;
//     description: string;
//     category: string;
//     duration: number;
//     level: "Beginner" | "Intermediate" | "Advanced";
//     price: number;
//     isPremium: boolean;
//     thumbnail?: string;
//     status?: "draft" | "published" | "archived";
//   };
// }

// export const CourseForm = ({ initialData }: CourseFormProps) => {
//   const router = useRouter();
//   const isEditMode = !!initialData;

//   const [formData, setFormData] = useState({
//     title: initialData?.title || "",
//     description: initialData?.description || "",
//     category: initialData?.category || "",
//     duration: initialData?.duration || 0,
//     level: initialData?.level || "Beginner",
//     price: initialData?.price || 0,
//     isPremium: initialData?.isPremium || false,
//     status: initialData?.status || "draft",
//   });

//   const [thumbnail, setThumbnail] = useState<File | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "duration" || name === "price" ? Number(value) : value,
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setThumbnail(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       toast.success(
//         isEditMode
//           ? "Course updated successfully!"
//           : "Course created successfully!"
//       );
//       router.push("/admin/course-management");
//     } catch (error) {
//       toast.error("An error occurred. Please try again.");
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="full mx-auto ">
//       <Button
//         variant="outline"
//         size="sm"
//         className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 mb-6 cursor-pointer"
//         onClick={() => router.back()}
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back
//       </Button>

//       <Card>
//         <CardHeader>
//           <CardTitle>{isEditMode ? "Edit Course" : "Create Course"}</CardTitle>
//           <CardDescription>
//             {isEditMode
//               ? "Update your course details"
//               : "Fill in the form to create a new course"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   placeholder="Course title"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Input
//                   id="category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   placeholder="Course category"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="duration">Duration (minutes)</Label>
//                 <Input
//                   id="duration"
//                   name="duration"
//                   type="number"
//                   value={formData.duration}
//                   onChange={handleChange}
//                   min="0"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="level">Level</Label>
//                 <Select
//                   value={formData.level}
//                   onValueChange={(value) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       level: value as "Beginner" | "Intermediate" | "Advanced",
//                     }))
//                   }
//                 >
//                   <SelectTrigger className="cursor-pointer">
//                     <SelectValue placeholder="Select level" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Beginner">Beginner</SelectItem>
//                     <SelectItem value="Intermediate">Intermediate</SelectItem>
//                     <SelectItem value="Advanced">Advanced</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="price">Price ($)</Label>
//                 <Input
//                   id="price"
//                   name="price"
//                   type="number"
//                   value={formData.price}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   value={formData.status}
//                   onValueChange={(value) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       status: value as "draft" | "published" | "archived",
//                     }))
//                   }
//                 >
//                   <SelectTrigger className="cursor-pointer">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="draft">Draft</SelectItem>
//                     <SelectItem value="published">Published</SelectItem>
//                     <SelectItem value="archived">Archived</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <Label>Premium Course</Label>
//                   <p className="text-sm text-muted-foreground">
//                     Enable to mark this as a premium course
//                   </p>
//                 </div>
//                 <Switch
//                   className="cursor-pointer"
//                   checked={formData.isPremium}
//                   onCheckedChange={(checked) =>
//                     setFormData((prev) => ({ ...prev, isPremium: checked }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="min-h-[200px]"
//                 placeholder="Detailed course description"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="thumbnail">Thumbnail</Label>
//               <Input
//                 id="thumbnail"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//               />
//               {thumbnail && (
//                 <div className="mt-4">
//                   <p className="text-sm text-muted-foreground mb-2">Preview:</p>
//                   <div className="rounded-md overflow-hidden border w-48">
//                     <Image
//                       width={192}
//                       height={108}
//                       style={{ objectFit: "cover" }}
//                       src={URL.createObjectURL(thumbnail)}
//                       alt="Thumbnail preview"
//                       className="w-full h-auto"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <CardFooter className="flex justify-end px-0 pt-6">
//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200 cursor-pointer ${
//                   isEditMode
//                     ? "border border-[var(--color-blueOne)] bg-transparent text-[var(--color-blueOne)] hover:bg-[var(--color-blueOne)] hover:text-white"
//                     : ""
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     {isEditMode ? "Updating..." : "Creating..."}
//                   </>
//                 ) : isEditMode ? (
//                   "Update Course"
//                 ) : (
//                   "Create Course"
//                 )}
//               </Button>
//             </CardFooter>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { toast } from "@/components/ui/use-toast";
// import { Loader2, ArrowLeft } from "lucide-react";
// import { Dropzone } from "@/components/ui/dropzone";
// import { Badge } from "@/components/ui/badge";

// const formSchema = z.object({
//   title: z.string().min(2, {
//     message: "Title must be at least 2 characters.",
//   }),
//   description: z.string().min(10, {
//     message: "Description must be at least 10 characters.",
//   }),
//   category: z.string().min(1, {
//     message: "Category is required.",
//   }),
//   duration: z.coerce.number().min(1, {
//     message: "Duration must be at least 1 minute.",
//   }),
//   level: z.enum(["beginner", "intermediate", "advanced"]),
//   price: z.coerce.number().min(0, {
//     message: "Price cannot be negative.",
//   }),
//   isPremium: z.boolean(),
//   thumbnail: z.any().optional(),
// });

// type CourseFormValues = z.infer<typeof formSchema>;

// interface CourseFormProps {
//   initialData?: {
//     _id: string;
//     title: string;
//     description: string;
//     category: string;
//     duration: number;
//     level: "beginner" | "intermediate" | "advanced";
//     price: number;
//     isPremium: boolean;
//     thumbnail?: string;
//   };
// }

// export const CourseForm = ({ initialData }: CourseFormProps) => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(
//     initialData?.thumbnail || null
//   );

//   const form = useForm<CourseFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData || {
//       title: "",
//       description: "",
//       category: "",
//       duration: 0,
//       level: "beginner",
//       price: 0,
//       isPremium: false,
//     },
//   });

//   const onSubmit = async (data: CourseFormValues) => {
//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("title", data.title);
//       formData.append("description", data.description);
//       formData.append("category", data.category);
//       formData.append("duration", data.duration.toString());
//       formData.append("level", data.level);
//       formData.append("price", data.price.toString());
//       formData.append("isPremium", data.isPremium.toString());

//       if (file) {
//         formData.append("thumbnail", file);
//       }

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       toast({
//         title: initialData ? "Course updated!" : "Course created!",
//         description: initialData
//           ? "Your course has been updated successfully."
//           : "Your course has been created successfully.",
//       });

//       router.push("/admin/courses");
//       router.refresh();
//     } catch (error) {
//       toast({
//         title: "Something went wrong.",
//         description: "Please try again later.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDrop = (acceptedFiles: File[]) => {
//     const file = acceptedFiles[0];
//     setFile(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => router.back()}
//         className="mb-6"
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back
//       </Button>

//       <Card>
//         <CardHeader>
//           <CardTitle>{initialData ? "Edit Course" : "Create Course"}</CardTitle>
//           <CardDescription>
//             {initialData
//               ? "Update your course details"
//               : "Fill in the form to create a new course"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Title</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder="Course title"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="category"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Category</FormLabel>
//                       <FormControl>
//                         <Input
//                           disabled={loading}
//                           placeholder="Web Development"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="duration"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Duration (minutes)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           disabled={loading}
//                           placeholder="120"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="level"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Level</FormLabel>
//                       <Select
//                         disabled={loading}
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select a level" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="beginner">
//                             <Badge variant="secondary">Beginner</Badge>
//                           </SelectItem>
//                           <SelectItem value="intermediate">
//                             <Badge variant="secondary">Intermediate</Badge>
//                           </SelectItem>
//                           <SelectItem value="advanced">
//                             <Badge variant="secondary">Advanced</Badge>
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="price"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Price ($)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           disabled={loading}
//                           placeholder="29.99"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="isPremium"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                       <div className="space-y-0.5">
//                         <FormLabel>Premium Course</FormLabel>
//                         <FormDescription>
//                           Enable to mark this as a premium course
//                         </FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch
//                           checked={field.value}
//                           onCheckedChange={field.onChange}
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         disabled={loading}
//                         placeholder="Course description"
//                         className="min-h-[200px]"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="space-y-2">
//                 <FormLabel>Thumbnail</FormLabel>
//                 <Dropzone
//                   accept={{ "image/*": [] }}
//                   onDrop={handleDrop}
//                   maxFiles={1}
//                 >
//                   {({ getRootProps, getInputProps }) => (
//                     <div
//                       {...getRootProps()}
//                       className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
//                     >
//                       <input {...getInputProps()} />
//                       <p className="text-muted-foreground">
//                         Drag and drop an image here, or click to select file
//                       </p>
//                     </div>
//                   )}
//                 </Dropzone>
//                 {preview && (
//                   <div className="mt-4">
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Preview:
//                     </p>
//                     <img
//                       src={preview}
//                       alt="Thumbnail preview"
//                       className="rounded-md object-cover h-48 w-full"
//                     />
//                   </div>
//                 )}
//                 {initialData?.thumbnail && !file && (
//                   <div className="mt-4">
//                     <p className="text-sm text-muted-foreground">
//                       Current thumbnail: {initialData.thumbnail}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <CardFooter className="flex justify-end px-0 pt-6">
//                 <Button type="submit" disabled={loading}>
//                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                   {initialData ? "Update Course" : "Create Course"}
//                 </Button>
//               </CardFooter>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
