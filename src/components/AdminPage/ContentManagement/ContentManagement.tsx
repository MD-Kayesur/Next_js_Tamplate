// src/components/AdminPage/ContentManagement/ContentManagement.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { useGetCoursesQuery } from "@/redux/features/auth/courseApi";
import { useGetModulesByCourseQuery } from "@/redux/features/auth/moduleApi";
import {
  useGetContentsByModuleQuery,
  useDeleteContentMutation,
  useUpdateContentViewMutation,
} from "@/redux/features/auth/contentApi";
import {
  setContents,
  removeContent,
  setCurrentContent,
  openUpdateDialog,
} from "@/redux/features/auth/contentSlice";
import { UpdateContentDialog } from "./UpdateContentDialog";

import Title from "@/components/reuseabelComponents/Title";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  MoreVertical,
  Loader2,
  Play,
  X,
  Search,
} from "lucide-react";
import { Content } from "@/redux/types/venue.type";
import LoadingScreen from "../Shared/LoadingScreen";

const ContentManagement = () => {
  const dispatch = useAppDispatch();
  const { contents } = useAppSelector((state) => state.content);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<{
    id: string;
    moduleId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  const { data: courses } = useGetCoursesQuery();
  const { data: modules } = useGetModulesByCourseQuery(selectedCourse, {
    skip: !selectedCourse,
  });
  const { data: fetchedContents, isLoading } = useGetContentsByModuleQuery(
    selectedModule,
    { skip: !selectedModule }
  );

  const [deleteContent] = useDeleteContentMutation();
  const [updateContentView] = useUpdateContentViewMutation();

  useEffect(() => {
    if (fetchedContents) {
      dispatch(setContents(fetchedContents));
    }
  }, [fetchedContents, dispatch]);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setDeleteDialogOpen(false);
      }
    };

    if (deleteDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [deleteDialogOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (deleteDialogOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [deleteDialogOpen]);

  const handleVideoPlay = async (contentId: string) => {
    try {
      const response = await updateContentView(contentId).unwrap();
      console.log("View count updated:", response);
    } catch (error) {
      console.error("Failed to update view count:", error);
    }
  };

  const handleEditClick = (content: Content) => {
    dispatch(setCurrentContent(content));
    dispatch(openUpdateDialog());
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteContent({
        id: contentToDelete.id,
        moduleId: contentToDelete.moduleId,
      }).unwrap();

      dispatch(removeContent(contentToDelete.id));
      toast.success("Content deleted successfully");
    } catch {
      toast.error("Failed to delete content");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredContents = contents.filter((content) => {
    const term = searchTerm.toLowerCase();
    return (
      content.title.toLowerCase().includes(term) ||
      content.description.toLowerCase().includes(term) ||
      content.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title title="Content Management" />
        <Button
          asChild
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
        >
          <Link href="/admin/content-management/new">
            <Plus className="w-4 h-4 mr-2" /> Add New Content
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b px-4 py-6 bg-white shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-col md:flex-col md:gap-5 lg:flex-row lg:items-center lg:justify-between xl:gap-6 2xl:gap-8">
            <div>
              <CardTitle className="text-xl font-normal font-sans ">
                Content Library
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {isLoading ? "Loading..." : `${filteredContents.length} Videos`}
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-full md:w-3/4 lg:w-[360px] xl:w-[400px] 2xl:w-[480px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search contents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-md border border-gray-300 focus:ring-primary focus:border-primary text-sm"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:opacity-75"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto md:flex-row lg:flex-row">
              <Select
                value={selectedCourse}
                onValueChange={(val) => {
                  setSelectedCourse(val);
                  setSelectedModule("");
                }}
              >
                <SelectTrigger className="w-full sm:w-44 h-10 rounded-md border-gray-300 focus:ring-primary focus:border-primary cursor-pointer">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedModule}
                onValueChange={setSelectedModule}
                disabled={!selectedCourse}
              >
                <SelectTrigger className="w-full sm:w-44 h-10 rounded-md border-gray-300 focus:ring-primary focus:border-primary cursor-pointer">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modules</SelectItem>
                  {modules?.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className=" p-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, idx) => (
              <Skeleton key={idx} className="h-48 w-full rounded-lg" />
            ))
          ) : !selectedModule ? (
            <div className="col-span-full flex flex-col items-center justify-center  space-y-4">
              <div className="text-lg text-muted-foreground">
                <LoadingScreen />
              </div>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
              <Play className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No content found</p>
              <Button asChild>
                <Link href="/admin/content-management/new">
                  <Plus className="w-4 h-4 mr-2" /> Add Content
                </Link>
              </Button>
            </div>
          ) : (
            filteredContents.map((content) => (
              <Card key={content.id} className="border shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {content.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => {
                            setContentToDelete({
                              id: content.id,
                              moduleId: content.moduleId,
                            });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <video
                    controls
                    className="rounded w-full"
                    onPlay={() => handleVideoPlay(content.id)}
                  >
                    <source src={content.url} type="video/mp4" />
                  </video>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {content.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {content.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Duration: {formatDuration(content.duration)} | Views:{" "}
                    {content.viewCount}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {formatDate(content.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Custom Modal for Delete Confirmation */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.2px] bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <h2 id="modal-title" className="text-lg font-semibold mb-4">
              Confirm Deletion
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete this content and all its associated
              data.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 text-white  hover:bg-red-700 px-4 py-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Deleting...
                  </>
                ) : (
                  "Delete Content"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <UpdateContentDialog />
    </div>
  );
};

export default ContentManagement;

// // src/components/AdminPage/ContentManagement/ContentManagement.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { useGetCoursesQuery } from "@/redux/features/auth/courseApi";
// import { useGetModulesByCourseQuery } from "@/redux/features/auth/moduleApi";
// import {
//   useGetContentsByModuleQuery,
//   useDeleteContentMutation,
//   useUpdateContentViewMutation,
// } from "@/redux/features/auth/contentApi";
// import {
//   setContents,
//   removeContent,
//   setCurrentContent,
//   openUpdateDialog,
// } from "@/redux/features/auth/contentSlice";
// import { UpdateContentDialog } from "./UpdateContentDialog";

// import Title from "@/components/reuseabelComponents/Title";
// import { toast } from "sonner";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Plus,
//   Trash2,
//   MoreVertical,
//   Loader2,
//   Play,
//   X,
//   Search,
// } from "lucide-react";
// import { Content } from "@/redux/types/venue.type";
// import LoadingScreen from "../Shared/LoadingScreen";

// const ContentManagement = () => {
//   const dispatch = useAppDispatch();
//   const { contents } = useAppSelector((state) => state.content);

//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [contentToDelete, setContentToDelete] = useState<{
//     id: string;
//     moduleId: string;
//   } | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCourse, setSelectedCourse] = useState<string>("");
//   const [selectedModule, setSelectedModule] = useState<string>("");

//   const { data: courses } = useGetCoursesQuery();
//   const { data: modules } = useGetModulesByCourseQuery(selectedCourse, {
//     skip: !selectedCourse,
//   });
//   const { data: fetchedContents, isLoading } = useGetContentsByModuleQuery(
//     selectedModule,
//     { skip: !selectedModule }
//   );

//   const [deleteContent] = useDeleteContentMutation();
//   const [updateContentView] = useUpdateContentViewMutation();

//   useEffect(() => {
//     if (fetchedContents) {
//       dispatch(setContents(fetchedContents));
//     }
//   }, [fetchedContents, dispatch]);

//   const handleVideoPlay = async (contentId: string) => {
//     try {
//       const response = await updateContentView(contentId).unwrap();
//       console.log("View count updated:", response);
//     } catch (error) {
//       console.error("Failed to update view count:", error);
//     }
//   };

//   const handleEditClick = (content: Content) => {
//     dispatch(setCurrentContent(content));
//     dispatch(openUpdateDialog());
//   };

//   // const handleDelete = async () => {
//   //   if (!contentToDelete) return;
//   //   setIsDeleting(true);
//   //   try {
//   //     await deleteContent({
//   //       id: contentToDelete.id,
//   //       moduleId: contentToDelete.moduleId,
//   //     }).unwrap();

//   //     dispatch(removeContent(contentToDelete.id));
//   //     toast.success("Content deleted successfully");
//   //   } catch {
//   //     toast.error("Failed to delete content");
//   //   } finally {
//   //     if (document.activeElement instanceof HTMLElement) {
//   //       document.activeElement.blur();
//   //     }

//   //     setIsDeleting(false);
//   //     setDeleteDialogOpen(false);
//   //     setContentToDelete(null);
//   //   }
//   // };

//   const handleDelete = async () => {
//     if (!contentToDelete) return;
//     setIsDeleting(true);
//     try {
//       await deleteContent({
//         id: contentToDelete.id,
//         moduleId: contentToDelete.moduleId,
//       }).unwrap();

//       dispatch(removeContent(contentToDelete.id));
//       toast.success("Content deleted successfully");

//       // Move focus to body before closing dialog
//       if (document.activeElement instanceof HTMLElement) {
//         document.activeElement.blur();
//       }
//     } catch {
//       toast.error("Failed to delete content");
//     } finally {
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//       setContentToDelete(null);
//     }
//   };
//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}m ${secs.toString().padStart(2, "0")}s`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const filteredContents = contents.filter((content) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       content.title.toLowerCase().includes(term) ||
//       content.description.toLowerCase().includes(term) ||
//       content.tags?.some((tag) => tag.toLowerCase().includes(term))
//     );
//   });

//   return (
//     <div className="w-full space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <Title title="Content Management" />
//         <Button
//           asChild
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
//         >
//           <Link href="/admin/content-management/new">
//             <Plus className="w-4 h-4 mr-2" /> Add New Content
//           </Link>
//         </Button>
//       </div>

//       <Card>
//         <CardHeader className="border-b px-4 py-6 bg-white shadow-sm">
//           <div className="flex flex-col gap-6 sm:flex-col md:flex-col md:gap-5 lg:flex-row lg:items-center lg:justify-between xl:gap-6 2xl:gap-8">
//             <div>
//               <CardTitle className="text-xl font-normal font-sans ">
//                 Content Library
//               </CardTitle>
//               <CardDescription className="text-sm text-muted-foreground mt-1">
//                 {isLoading ? "Loading..." : `${filteredContents.length} Videos`}
//               </CardDescription>
//             </div>

//             <div className="relative w-full sm:w-full md:w-3/4 lg:w-[360px] xl:w-[400px] 2xl:w-[480px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Search contents..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-10 h-10 rounded-md border border-gray-300 focus:ring-primary focus:border-primary text-sm"
//               />
//               {searchTerm && (
//                 <X
//                   className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:opacity-75"
//                   onClick={() => setSearchTerm("")}
//                 />
//               )}
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto md:flex-row lg:flex-row">
//               <Select
//                 value={selectedCourse}
//                 onValueChange={(val) => {
//                   setSelectedCourse(val);
//                   setSelectedModule("");
//                 }}
//               >
//                 <SelectTrigger className="w-full sm:w-44 h-10 rounded-md border-gray-300 focus:ring-primary focus:border-primary cursor-pointer">
//                   <SelectValue placeholder="Select course" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="">All Courses</SelectItem>
//                   {courses?.map((course) => (
//                     <SelectItem key={course.id} value={course.id}>
//                       {course.title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Select
//                 value={selectedModule}
//                 onValueChange={setSelectedModule}
//                 disabled={!selectedCourse}
//               >
//                 <SelectTrigger className="w-full sm:w-44 h-10 rounded-md border-gray-300 focus:ring-primary focus:border-primary cursor-pointer">
//                   <SelectValue placeholder="Select module" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="">All Modules</SelectItem>
//                   {modules?.map((module) => (
//                     <SelectItem key={module.id} value={module.id}>
//                       {module.title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className=" p-6 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
//           {isLoading ? (
//             [...Array(6)].map((_, idx) => (
//               <Skeleton key={idx} className="h-48 w-full rounded-lg" />
//             ))
//           ) : !selectedModule ? (
//             <div className="col-span-full flex flex-col items-center justify-center  space-y-4">
//               {/* <Play className="h-12 w-12 text-muted-foreground" /> */}
//               <div className="text-lg text-muted-foreground">
//                 <LoadingScreen />
//               </div>
//             </div>
//           ) : filteredContents.length === 0 ? (
//             <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
//               <Play className="h-12 w-12 text-muted-foreground" />
//               <p className="text-lg text-muted-foreground">No content found</p>
//               <Button asChild>
//                 <Link href="/admin/content-management/new">
//                   <Plus className="w-4 h-4 mr-2" /> Add Content
//                 </Link>
//               </Button>
//             </div>
//           ) : (
//             filteredContents.map((content) => (
//               <Card key={content.id} className="border shadow-sm">
//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <CardTitle className="text-base font-semibold line-clamp-1">
//                       {content.title}
//                     </CardTitle>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="cursor-pointer"
//                         >
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         {/* <DropdownMenuItem
//                           className="cursor-pointer"
//                           onClick={() => handleEditClick(content)}
//                         >
//                           <Pencil className="mr-2 h-4 w-4" /> Edit
//                         </DropdownMenuItem> */}
//                         <DropdownMenuItem
//                           className="text-destructive cursor-pointer"
//                           onClick={() => {
//                             setContentToDelete({
//                               id: content.id,
//                               moduleId: content.moduleId,
//                             });
//                             setDeleteDialogOpen(true);
//                           }}
//                         >
//                           <Trash2 className="mr-2 h-4 w-4" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <video
//                     controls
//                     className="rounded w-full"
//                     onPlay={() => handleVideoPlay(content.id)}
//                   >
//                     <source src={content.url} type="video/mp4" />
//                   </video>
//                   <p className="text-sm text-muted-foreground line-clamp-2">
//                     {content.description}
//                   </p>
//                   <div className="flex flex-wrap gap-1">
//                     {content.tags?.map((tag) => (
//                       <Badge key={tag} variant="outline" className="text-xs">
//                         {tag}
//                       </Badge>
//                     ))}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     Duration: {formatDuration(content.duration)} | Views:{" "}
//                     {content.viewCount}
//                   </div>
//                   <div className="text-xs text-gray-400">
//                     Created: {formatDate(content.createdAt)}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </CardContent>
//       </Card>

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete this content and all its associated
//               data.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="bg-destructive"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
//                 </>
//               ) : (
//                 "Delete Content"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <UpdateContentDialog />
//     </div>
//   );
// };

// export default ContentManagement;
