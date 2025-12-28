// src/components/AdminPage/ContentManagement/ContentVideoForm.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateContentMutation,
  useGetContentByIdQuery,
} from "@/redux/features/auth/contentApi";
import { useGetModulesByCourseQuery } from "@/redux/features/auth/moduleApi";
import { useGetCoursesQuery } from "@/redux/features/auth/courseApi";

interface ContentFormProps {
  contentId?: string;
}

export const ContentVideoForm = ({ contentId }: ContentFormProps) => {
  const router = useRouter();
  const isEditMode = !!contentId;

  const [courseId, setCourseId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    duration: 0,
    description: "",
    tags: [] as string[],
    moduleId: "",
    viewCount: 0,
  });

  const [currentTag, setCurrentTag] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: courses, isLoading: isCoursesLoading } = useGetCoursesQuery();
  const { data: fetchedModules, isLoading: isModulesLoading } =
    useGetModulesByCourseQuery(courseId, {
      skip: !courseId,
    });

  const { data: existingContent, isLoading: isFetching } =
    useGetContentByIdQuery(contentId || "", {
      skip: !contentId,
    });

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();

  useEffect(() => {
    if (existingContent) {
      setFormData({
        title: existingContent.title,
        file: null,
        duration: existingContent.duration,
        description: existingContent.description,
        tags: existingContent.tags || [],
        moduleId: existingContent.moduleId,
        viewCount: existingContent.viewCount || 0,
      });
      setPreviewUrl(existingContent.url);
    }
  }, [existingContent]);

  useEffect(() => {
    if (isEditMode && courses && formData.moduleId) {
      const foundCourse = courses.find((course) =>
        course.modules?.some((m) => m.id === formData.moduleId)
      );
      if (foundCourse) {
        setCourseId(foundCourse.id);
      }
    }
  }, [isEditMode, courses, formData.moduleId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "viewCount" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, file }));
      if (file.type.startsWith("video/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleAddTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim().toLowerCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.moduleId || formData.tags.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      formDataToSend.append("duration", formData.duration.toString());
      formDataToSend.append("description", formData.description);
      formData.tags.forEach((tag) => formDataToSend.append("tags", tag));
      formDataToSend.append("moduleId", formData.moduleId);
      formDataToSend.append("viewCount", formData.viewCount.toString());

      await createContent(formDataToSend).unwrap();
      toast.success("Content created successfully!");
      router.push("/admin/content-management");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  if (isFetching && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
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
          <CardTitle className="text-xl font-normal">
            {isEditMode ? "Edit Content" : "Create Content"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update your content details"
              : "Fill in the form to create new content"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div className="space-y-2">
                <Label className="font-medium text-black text-sm">Course</Label>
                <Select
                  value={courseId}
                  onValueChange={(value) => {
                    setCourseId(value);
                    setFormData((prev) => ({ ...prev, moduleId: "" }));
                  }}
                  disabled={isEditMode}
                >
                  <SelectTrigger className="cursor-pointer w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCoursesLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-black text-sm">Module</Label>
                <Select
                  value={formData.moduleId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, moduleId: value }))
                  }
                  required
                  disabled={!courseId || isModulesLoading}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {isModulesLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : fetchedModules?.length ? (
                      fetchedModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">
                        {courseId
                          ? "No modules found"
                          : "Select a course first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Content title"
                  required
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds) </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewCount">View Count</Label>
                <Input
                  id="viewCount"
                  name="viewCount"
                  type="number"
                  value={formData.viewCount}
                  onChange={handleChange}
                  min="0"
                />
              </div> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[90px]"
                placeholder="Detailed content description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Video File {!isEditMode}</Label>
              <div className="flex items-center gap-4">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">
                        Click to upload Video Content
                      </span>
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required={!isEditMode}
                  />
                </Label>
                {previewUrl && (
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                    <video
                      src={previewUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                      autoPlay
                      loop
                    />
                  </div>
                )}
              </div>
              {formData.file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected file: {formData.file.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags </Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Add at least one tag
                </p>
              )}
            </div>

            <CardFooter className="flex justify-end px-0 pt-2">
              <Button
                type="submit"
                className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                disabled={
                  isCreating ||
                  formData.tags.length === 0 ||
                  !formData.moduleId ||
                  (!isEditMode && !formData.file)
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Content"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// // src/components/AdminPage/ContentManagement/ContentVideoForm.tsx
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
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { ArrowLeft, Loader2, X, Upload } from "lucide-react";
// import { toast } from "sonner";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   useCreateContentMutation,
//   useGetContentByIdQuery,
// } from "@/redux/features/auth/contentApi";
// import { useGetModulesByCourseQuery } from "@/redux/features/auth/moduleApi";
// import { useGetCoursesQuery } from "@/redux/features/auth/courseApi";

// interface ContentFormProps {
//   contentId?: string;
// }

// export const ContentVideoForm = ({ contentId }: ContentFormProps) => {
//   const router = useRouter();
//   const isEditMode = !!contentId;

//   const [courseId, setCourseId] = useState("");
//   const [formData, setFormData] = useState({
//     title: "",
//     file: null as File | null,
//     description: "",
//     tags: [] as string[],
//     moduleId: "",
//   });

//   const [currentTag, setCurrentTag] = useState("");
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const { data: courses, isLoading: isCoursesLoading } = useGetCoursesQuery();
//   const { data: fetchedModules, isLoading: isModulesLoading } =
//     useGetModulesByCourseQuery(courseId, {
//       skip: !courseId,
//     });

//   const { data: existingContent, isLoading: isFetching } =
//     useGetContentByIdQuery(contentId || "", {
//       skip: !contentId,
//     });

//   const [createContent, { isLoading: isCreating }] = useCreateContentMutation();

//   useEffect(() => {
//     if (existingContent) {
//       setFormData({
//         title: existingContent.title,
//         file: null,
//         description: existingContent.description,
//         tags: existingContent.tags || [],
//         moduleId: existingContent.moduleId,
//       });
//       setPreviewUrl(existingContent.url);
//     }
//   }, [existingContent]);

//   useEffect(() => {
//     if (isEditMode && courses && formData.moduleId) {
//       const foundCourse = courses.find((course) =>
//         course.modules?.some((m) => m.id === formData.moduleId)
//       );
//       if (foundCourse) {
//         setCourseId(foundCourse.id);
//       }
//     }
//   }, [isEditMode, courses, formData.moduleId]);

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
//       setFormData((prev) => ({ ...prev, file }));
//       if (file.type.startsWith("video/")) {
//         setPreviewUrl(URL.createObjectURL(file));
//       }
//     }
//   };

//   const handleAddTag = () => {
//     if (
//       currentTag.trim() &&
//       !formData.tags.includes(currentTag.trim().toLowerCase())
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         tags: [...prev.tags, currentTag.trim().toLowerCase()],
//       }));
//       setCurrentTag("");
//     }
//   };

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((tag) => tag !== tagToRemove),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.moduleId || formData.tags.length === 0) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("title", formData.title);
//       if (formData.file) {
//         formDataToSend.append("file", formData.file);
//       }
//       formDataToSend.append("description", formData.description);
//       formData.tags.forEach((tag) => formDataToSend.append("tags", tag));
//       formDataToSend.append("moduleId", formData.moduleId);

//       await createContent(formDataToSend).unwrap();
//       toast.success("Content created successfully!");
//       router.push("/admin/content-management");
//     } catch (error) {
//       toast.error("An error occurred. Please try again.");
//       console.error(error);
//     } finally {
//       if (previewUrl) URL.revokeObjectURL(previewUrl);
//     }
//   };

//   if (isFetching && isEditMode) {
//     return (
//       <div className="flex justify-center items-center h-64">
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
//           <CardTitle className="text-xl font-normal">
//             {isEditMode ? "Edit Content" : "Create Content"}
//           </CardTitle>
//           <CardDescription>
//             {isEditMode
//               ? "Update your content details"
//               : "Fill in the form to create new content"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
//               <div className="space-y-2">
//                 <Label className="font-medium text-black text-sm">Course</Label>
//                 <Select
//                   value={courseId}
//                   onValueChange={(value) => {
//                     setCourseId(value);
//                     setFormData((prev) => ({ ...prev, moduleId: "" }));
//                   }}
//                   disabled={isEditMode}
//                 >
//                   <SelectTrigger className="cursor-pointer w-full">
//                     <SelectValue placeholder="Select course" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {isCoursesLoading ? (
//                       <div className="flex justify-center p-4">
//                         <Loader2 className="h-5 w-5 animate-spin" />
//                       </div>
//                     ) : (
//                       courses?.map((course) => (
//                         <SelectItem key={course.id} value={course.id}>
//                           {course.title}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label className="font-medium text-black text-sm">Module</Label>
//                 <Select
//                   value={formData.moduleId}
//                   onValueChange={(value) =>
//                     setFormData((prev) => ({ ...prev, moduleId: value }))
//                   }
//                   required
//                   disabled={!courseId || isModulesLoading}
//                 >
//                   <SelectTrigger className="w-full cursor-pointer">
//                     <SelectValue placeholder="Select module" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {isModulesLoading ? (
//                       <div className="flex justify-center p-4">
//                         <Loader2 className="h-5 w-5 animate-spin" />
//                       </div>
//                     ) : fetchedModules?.length ? (
//                       fetchedModules.map((module) => (
//                         <SelectItem key={module.id} value={module.id}>
//                           {module.title}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <div className="p-4 text-sm text-muted-foreground">
//                         {courseId
//                           ? "No modules found"
//                           : "Select a course first"}
//                       </div>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="title">Title </Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   placeholder="Content title"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description </Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="min-h-[90px]"
//                 placeholder="Detailed content description"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="file">Video File {!isEditMode}</Label>
//               <div className="flex items-center gap-4">
//                 <Label
//                   htmlFor="file-upload"
//                   className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
//                 >
//                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                     <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
//                     <p className="mb-2 text-sm text-muted-foreground">
//                       <span className="font-semibold">
//                         Click to upload Video Content
//                       </span>
//                     </p>
//                   </div>
//                   <Input
//                     id="file-upload"
//                     type="file"
//                     accept="video/*"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     required={!isEditMode}
//                   />
//                 </Label>
//                 {previewUrl && (
//                   <div className="relative w-32 h-32 rounded-md overflow-hidden border">
//                     <video
//                       src={previewUrl}
//                       className="w-full h-full object-cover"
//                       controls={false}
//                       muted
//                       autoPlay
//                       loop
//                     />
//                   </div>
//                 )}
//               </div>
//               {formData.file && (
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Selected file: {formData.file.name}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label>Tags </Label>
//               <div className="flex gap-2">
//                 <Input
//                   value={currentTag}
//                   onChange={(e) => setCurrentTag(e.target.value)}
//                   placeholder="Add a tag"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       handleAddTag();
//                     }
//                   }}
//                 />
//                 <Button
//                   className="cursor-pointer"
//                   type="button"
//                   variant="secondary"
//                   onClick={handleAddTag}
//                 >
//                   Add
//                 </Button>
//               </div>
//               {formData.tags.length > 0 ? (
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {formData.tags.map((tag) => (
//                     <Badge key={tag} className="flex items-center gap-1">
//                       {tag}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveTag(tag)}
//                         className="hover:text-red-500 cursor-pointer"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Add at least one tag
//                 </p>
//               )}
//             </div>

//             <CardFooter className="flex justify-end px-0 pt-2">
//               <Button
//                 type="submit"
//                 className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//                 disabled={
//                   isCreating ||
//                   formData.tags.length === 0 ||
//                   !formData.moduleId ||
//                   (!isEditMode && !formData.file)
//                 }
//               >
//                 {isCreating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Create Content"
//                 )}
//               </Button>
//             </CardFooter>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
