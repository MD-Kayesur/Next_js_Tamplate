"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@/redux/features/auth/courseApi";

export default function EditCourseForm() {
  const params = useParams(); // get params from hook
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? ""; // ensure id is a string
  const router = useRouter();

  const { data: course, isLoading: isFetching } = useGetCourseByIdQuery(id, {
    skip: !id, // skip query if id is empty
  });
  const [updateCourse, { isLoading }] = useUpdateCourseMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isPaid: false,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category.join(","),
        isPaid: course.isPaid,
      });
      setThumbnailPreview(course.thumbnail);
    }
  }, [course]);

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
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Invalid course ID");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("isPaid", String(formData.isPaid));
    formDataToSend.append("category", formData.category);

    if (thumbnail) {
      formDataToSend.append("thumbnail", thumbnail);
    }

    try {
      await updateCourse({ id, body: formDataToSend }).unwrap();
      toast.success("Course updated successfully!");
      router.push("/admin/course-management");
    } catch (error) {
      toast.error("Failed to update course");
      console.error("Update error:", error);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
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
          <CardTitle>Edit Course</CardTitle>
          <CardDescription>Update your course details</CardDescription>
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
                  placeholder="Comma separated categories (e.g., backend,typescript)"
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
                className="min-h-[200px]"
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
                onChange={handleFileChange}
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Thumbnail Preview:
                  </p>
                  <div className="rounded-md overflow-hidden border w-48">
                    <Image
                      width={192}
                      height={108}
                      style={{ objectFit: "cover" }}
                      src={thumbnailPreview}
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
                className="border border-[var(--color-blueOne)] bg-transparent text-[var(--color-blueOne)] hover:bg-[var(--color-blueOne)] hover:text-white cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Course"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// // src/app/admin/course-management/[id]/edit/page.tsx
// "use client";

// import { useState, useEffect } from "react";
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
// import { Switch } from "@/components/ui/switch";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import Image from "next/image";
// import {
//   useGetCourseByIdQuery,
//   useUpdateCourseMutation,
// } from "@/redux/features/auth/courseApi";

// interface PageProps {
//   params: { id: string };
// }

// export default function EditCourseForm({ params }: PageProps) {
//   const { id } = params;
//   const router = useRouter();
//   const { data: course, isLoading: isFetching } = useGetCourseByIdQuery(id);
//   const [updateCourse, { isLoading }] = useUpdateCourseMutation();

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     isPaid: false,
//   });

//   const [thumbnail, setThumbnail] = useState<File | null>(null);
//   const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

//   useEffect(() => {
//     if (course) {
//       setFormData({
//         title: course.title,
//         description: course.description,
//         category: course.category.join(","),
//         isPaid: course.isPaid,
//       });
//       setThumbnailPreview(course.thumbnail);
//     }
//   }, [course]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setThumbnail(file);
//       setThumbnailPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     formDataToSend.append("title", formData.title);
//     formDataToSend.append("description", formData.description);
//     formDataToSend.append("isPaid", String(formData.isPaid));
//     formDataToSend.append("category", formData.category);

//     if (thumbnail) {
//       formDataToSend.append("thumbnail", thumbnail);
//     }

//     try {
//       await updateCourse({ id, body: formDataToSend }).unwrap();
//       toast.success("Course updated successfully!");
//       router.push("/admin/course-management");
//     } catch (error) {
//       toast.error("Failed to update course");
//       console.error("Update error:", error);
//     }
//   };

//   if (isFetching) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full mx-auto">
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
//           <CardTitle>Edit Course</CardTitle>
//           <CardDescription>Update your course details</CardDescription>
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
//                   placeholder="Comma separated categories (e.g., backend,typescript)"
//                   required
//                 />
//               </div>

//               <div className="flex items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <Label>Paid Course</Label>
//                   <p className="text-sm text-muted-foreground">
//                     Enable to mark this as a paid course
//                   </p>
//                 </div>
//                 <Switch
//                   checked={formData.isPaid}
//                   onCheckedChange={(checked) =>
//                     setFormData((prev) => ({ ...prev, isPaid: checked }))
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
//               {thumbnailPreview && (
//                 <div className="mt-4">
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Thumbnail Preview:
//                   </p>
//                   <div className="rounded-md overflow-hidden border w-48">
//                     <Image
//                       width={192}
//                       height={108}
//                       style={{ objectFit: "cover" }}
//                       src={thumbnailPreview}
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
//                 disabled={isLoading}
//                 className="border border-[var(--color-blueOne)] bg-transparent text-[var(--color-blueOne)] hover:bg-[var(--color-blueOne)] hover:text-white"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   "Update Course"
//                 )}
//               </Button>
//             </CardFooter>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
