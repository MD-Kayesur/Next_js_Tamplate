// src/app/admin/course-management/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutList,
  MoreVertical,
  Loader2,
  Eye,
  X,
  Filter,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import {
  setSearchTerm,
  setFilterPaid,
  setCurrentPage,
} from "@/redux/features/auth/courseSlice";
import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/redux/features/auth/courseApi";
import Image from "next/image";
import { Course } from "@/redux/types/venue.type";
import Title from "@/components/reuseabelComponents/Title";
import PageLoader from "../Shared/PageLoader";

const PAGE_SIZE = 6;

const CourseManagement = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, filterPaid, currentPage } = useAppSelector(
    (state) => state.course
  );
  const { data: courses, isLoading, error, refetch } = useGetCoursesQuery();
  console.log("Courses data:", courses);
  const [deleteCourse] = useDeleteCourseMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete).unwrap();
      toast.success("Course deleted successfully");
      refetch(); // Refresh the course list
    } catch (err) {
      toast.error("Failed to delete course");
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCourses =
    courses?.filter((course: Course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.some((cat) =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilter =
        filterPaid === "all" ||
        (filterPaid === "paid" && course.isPaid) ||
        (filterPaid === "free" && !course.isPaid);

      return matchesSearch && matchesFilter;
    }) || [];

  // Pagination logic
  const totalCourses = filteredCourses.length;
  const totalPages = Math.ceil(totalCourses / PAGE_SIZE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (newPage: number) => {
    dispatch(setCurrentPage(newPage));
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-red-500 text-lg">
            Failed to load courses. Please try again later.
          </div>
          <Button
            className="cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title title="Course Management" />
        <Button
          asChild
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
        >
          <Link href="/admin/course-management/new">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-normal">
                Course Catalog
              </CardTitle>
              <CardDescription className="text-sm">
                {isLoading
                  ? "Loading..."
                  : `${filteredCourses.length} courses found`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => {
                    dispatch(setSearchTerm(e.target.value));
                    dispatch(setCurrentPage(1)); // Reset to first page when searching
                  }}
                  className="pl-9 pr-9"
                />
                {searchTerm && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => {
                      dispatch(setSearchTerm(""));
                      dispatch(setCurrentPage(1)); // Reset to first page when clearing search
                    }}
                  />
                )}
              </div>
              <Select
                value={filterPaid}
                onValueChange={(value) => {
                  dispatch(setFilterPaid(value as "all" | "paid" | "free"));
                  dispatch(setCurrentPage(1)); // Reset to first page when changing filter
                }}
              >
                <SelectTrigger className="w-[180px] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="cursor-pointer">
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="paid">Paid Courses</SelectItem>
                  <SelectItem value="free">Free Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {/* {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))} */}
              <PageLoader />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LayoutList className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No courses found</p>
              <Button className="cursor-pointer" asChild>
                <Link href="/admin/course-management/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create a Course
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
                    <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                      <TableHead className="w-[100px] px-4 py-3">
                        Thumbnail
                      </TableHead>
                      <TableHead className="px-4 py-3">Title</TableHead>
                      <TableHead className="px-4 py-3">Description</TableHead>
                      <TableHead className="px-4 py-3">Categories</TableHead>
                      <TableHead className="w-[100px] px-4 py-3">
                        Type
                      </TableHead>
                      <TableHead className="w-[120px] px-4 py-3">
                        Created
                      </TableHead>
                      <TableHead className="w-[150px] px-4 py-3 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-muted/50">
                        {/* Thumbnail */}
                        <TableCell className="py-4">
                          <div className="flex items-center">
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={64}
                              height={36}
                              className="rounded-md object-cover aspect-video"
                              priority={false}
                            />
                          </div>
                        </TableCell>

                        {/* Title */}
                        <TableCell className="py-4">
                          <div className="font-medium text-sm line-clamp-2 max-w-[220px]">
                            {course.title}
                          </div>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="py-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                            {course.description}
                          </p>
                        </TableCell>

                        {/* Categories */}
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {course.category.map((cat) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="capitalize text-xs"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* Paid or Free */}
                        <TableCell className="py-4">
                          <Badge
                            className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded-md ${
                              course.isPaid
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {course.isPaid ? "Paid" : "Free"}
                          </Badge>
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                          <time dateTime={course.createdAt}>
                            {formatDate(course.createdAt)}
                          </time>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              {/* Preview Button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    asChild
                                  >
                                    <Link
                                      href={`/admin/course-management/${course.id}/preview`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview</TooltipContent>
                              </Tooltip>

                              {/* Dropdown Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 data-[state=open]:bg-muted cursor-pointer"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  {/* Edit */}
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/admin/course-management/${course.id}/edit`}
                                      className="flex items-center w-full cursor-pointer"
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>

                                  {/* Delete */}
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                    onClick={() => {
                                      setCourseToDelete(course.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * PAGE_SIZE, totalCourses)}
                  </span>{" "}
                  of <span className="font-medium">{totalCourses}</span> courses
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                    style={{
                      backgroundColor: currentPage === 1 ? "white" : "white",
                      color: "#2D0954",
                      borderColor: "#2D0954",
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                    style={{
                      backgroundColor:
                        currentPage === totalPages ? "white" : "white",
                      color: "#2D0954",
                      borderColor: "#2D0954",
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Custom Delete Confirmation Modal */}
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
              This will permanently delete the course and all its associated
              data. This action cannot be undone.
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Course"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;

// // src/app/admin/course-management/page.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tooltip,
//   TooltipTrigger,
//   TooltipContent,
//   TooltipProvider,
// } from "@/components/ui/tooltip";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   LayoutList,
//   MoreVertical,
//   Loader2,
//   Eye,
//   X,
//   Filter,
//   Search,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
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
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import {
//   setSearchTerm,
//   setFilterPaid,
//   setCurrentPage,
// } from "@/redux/features/auth/courseSlice";
// import {
//   useDeleteCourseMutation,
//   useGetCoursesQuery,
// } from "@/redux/features/auth/courseApi";
// import Image from "next/image";
// import { Course } from "@/redux/types/venue.type";
// import Title from "@/components/reuseabelComponents/Title";

// const PAGE_SIZE = 6;

// const CourseManagement = () => {
//   const dispatch = useAppDispatch();
//   const { searchTerm, filterPaid, currentPage } = useAppSelector(
//     (state) => state.course
//   );
//   const { data: courses, isLoading, error, refetch } = useGetCoursesQuery();
//   console.log("Courses data:", courses);
//   const [deleteCourse] = useDeleteCourseMutation();

//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDelete = async () => {
//     if (!courseToDelete) return;

//     setIsDeleting(true);
//     try {
//       await deleteCourse(courseToDelete).unwrap();
//       toast.success("Course deleted successfully");
//       refetch(); // Refresh the course list
//     } catch (err) {
//       toast.error("Failed to delete course");
//       console.error("Error deleting course:", err);
//     } finally {
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//       setCourseToDelete(null);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const filteredCourses =
//     courses?.filter((course: Course) => {
//       const matchesSearch =
//         course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         course.category.some((cat) =>
//           cat.toLowerCase().includes(searchTerm.toLowerCase())
//         );

//       const matchesFilter =
//         filterPaid === "all" ||
//         (filterPaid === "paid" && course.isPaid) ||
//         (filterPaid === "free" && !course.isPaid);

//       return matchesSearch && matchesFilter;
//     }) || [];

//   // Pagination logic
//   const totalCourses = filteredCourses.length;
//   const totalPages = Math.ceil(totalCourses / PAGE_SIZE);
//   const paginatedCourses = filteredCourses.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   const handlePageChange = (newPage: number) => {
//     dispatch(setCurrentPage(newPage));
//   };

//   if (error) {
//     return (
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col items-center justify-center space-y-4">
//           <div className="text-red-500 text-lg">
//             Failed to load courses. Please try again later.
//           </div>
//           <Button
//             className="cursor-pointer"
//             onClick={() => window.location.reload()}
//           >
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full mx-auto space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <Title title="Course Management" />
//         <Button
//           asChild
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//         >
//           <Link href="/admin/course-management/new">
//             <Plus className="w-4 h-4 mr-2" />
//             New Course
//           </Link>
//         </Button>
//       </div>

//       <Card className="overflow-hidden">
//         <CardHeader className="border-b">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <CardTitle className="text-xl font-normal">
//                 Course Catalog
//               </CardTitle>
//               <CardDescription className="text-sm">
//                 {isLoading
//                   ? "Loading..."
//                   : `${filteredCourses.length} courses found`}
//               </CardDescription>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//               <div className="relative w-full sm:w-64">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search courses..."
//                   value={searchTerm}
//                   onChange={(e) => {
//                     dispatch(setSearchTerm(e.target.value));
//                     dispatch(setCurrentPage(1)); // Reset to first page when searching
//                   }}
//                   className="pl-9 pr-9"
//                 />
//                 {searchTerm && (
//                   <X
//                     className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:opacity-75 transition-opacity"
//                     onClick={() => {
//                       dispatch(setSearchTerm(""));
//                       dispatch(setCurrentPage(1)); // Reset to first page when clearing search
//                     }}
//                   />
//                 )}
//               </div>
//               <Select
//                 value={filterPaid}
//                 onValueChange={(value) => {
//                   dispatch(setFilterPaid(value as "all" | "paid" | "free"));
//                   dispatch(setCurrentPage(1)); // Reset to first page when changing filter
//                 }}
//               >
//                 <SelectTrigger className="w-[180px] cursor-pointer">
//                   <div className="flex items-center gap-2">
//                     <Filter className="h-4 w-4 text-muted-foreground" />
//                     <SelectValue placeholder="Filter by type" />
//                   </div>
//                 </SelectTrigger>
//                 <SelectContent className="cursor-pointer">
//                   <SelectItem value="all">All Courses</SelectItem>
//                   <SelectItem value="paid">Paid Courses</SelectItem>
//                   <SelectItem value="free">Free Courses</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           {isLoading ? (
//             <div className="p-6 space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <Skeleton key={i} className="h-16 w-full" />
//               ))}
//             </div>
//           ) : filteredCourses.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 space-y-4">
//               <LayoutList className="h-12 w-12 text-muted-foreground" />
//               <p className="text-lg text-muted-foreground">No courses found</p>
//               <Button className="cursor-pointer" asChild>
//                 <Link href="/admin/course-management/new">
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create a Course
//                 </Link>
//               </Button>
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
//                     <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
//                       <TableHead className="w-[100px] px-4 py-3">
//                         Thumbnail
//                       </TableHead>
//                       <TableHead className="px-4 py-3">Title</TableHead>
//                       <TableHead className="px-4 py-3">Description</TableHead>
//                       <TableHead className="px-4 py-3">Categories</TableHead>
//                       <TableHead className="w-[100px] px-4 py-3">
//                         Type
//                       </TableHead>
//                       <TableHead className="w-[120px] px-4 py-3">
//                         Created
//                       </TableHead>
//                       <TableHead className="w-[150px] px-4 py-3 text-right">
//                         Actions
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {paginatedCourses.map((course) => (
//                       <TableRow key={course.id} className="hover:bg-muted/50">
//                         {/* Thumbnail */}
//                         <TableCell className="py-4">
//                           <div className="flex items-center">
//                             <Image
//                               src={course.thumbnail}
//                               alt={course.title}
//                               width={64}
//                               height={36}
//                               className="rounded-md object-cover aspect-video"
//                               priority={false}
//                             />
//                           </div>
//                         </TableCell>

//                         {/* Title */}
//                         <TableCell className="py-4">
//                           <div className="font-medium text-sm line-clamp-2 max-w-[220px]">
//                             {course.title}
//                           </div>
//                         </TableCell>

//                         {/* Description */}
//                         <TableCell className="py-4">
//                           <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
//                             {course.description}
//                           </p>
//                         </TableCell>

//                         {/* Categories */}
//                         <TableCell className="py-4">
//                           <div className="flex flex-wrap gap-1 max-w-[200px]">
//                             {course.category.map((cat) => (
//                               <Badge
//                                 key={cat}
//                                 variant="outline"
//                                 className="capitalize text-xs"
//                               >
//                                 {cat}
//                               </Badge>
//                             ))}
//                           </div>
//                         </TableCell>

//                         {/* Paid or Free */}
//                         <TableCell className="py-4">
//                           <Badge
//                             className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded-md ${
//                               course.isPaid
//                                 ? "bg-green-100 text-green-700 hover:bg-green-200"
//                                 : "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                             }`}
//                           >
//                             {course.isPaid ? "Paid" : "Free"}
//                           </Badge>
//                         </TableCell>

//                         {/* Created At */}
//                         <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
//                           <time dateTime={course.createdAt}>
//                             {formatDate(course.createdAt)}
//                           </time>
//                         </TableCell>

//                         {/* Actions */}
//                         <TableCell className="py-4">
//                           <div className="flex justify-end gap-2">
//                             <TooltipProvider>
//                               {/* Preview Button */}
//                               <Tooltip>
//                                 <TooltipTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8"
//                                     asChild
//                                   >
//                                     <Link
//                                       href={`/admin/course-management/${course.id}/preview`}
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                     </Link>
//                                   </Button>
//                                 </TooltipTrigger>
//                                 <TooltipContent>Preview</TooltipContent>
//                               </Tooltip>

//                               {/* Dropdown Actions */}
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8 data-[state=open]:bg-muted cursor-pointer"
//                                   >
//                                     <MoreVertical className="h-4 w-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent
//                                   align="end"
//                                   className="w-40"
//                                 >
//                                   {/* Edit */}
//                                   <DropdownMenuItem asChild>
//                                     <Link
//                                       href={`/admin/course-management/${course.id}/edit`}
//                                       className="flex items-center w-full cursor-pointer"
//                                     >
//                                       <Pencil className="mr-2 h-4 w-4" />
//                                       Edit
//                                     </Link>
//                                   </DropdownMenuItem>

//                                   {/* Delete */}
//                                   <DropdownMenuItem
//                                     className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
//                                     onClick={() => {
//                                       setCourseToDelete(course.id);
//                                       setDeleteDialogOpen(true);
//                                     }}
//                                   >
//                                     <Trash2 className="mr-2 h-4 w-4" />
//                                     Delete
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </TooltipProvider>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {/* Pagination */}
//               <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                 <div className="text-sm text-gray-700">
//                   Showing{" "}
//                   <span className="font-medium">
//                     {(currentPage - 1) * PAGE_SIZE + 1}
//                   </span>{" "}
//                   to{" "}
//                   <span className="font-medium">
//                     {Math.min(currentPage * PAGE_SIZE, totalCourses)}
//                   </span>{" "}
//                   of <span className="font-medium">{totalCourses}</span> courses
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//                     style={{
//                       backgroundColor: currentPage === 1 ? "white" : "white",
//                       color: "#2D0954",
//                       borderColor: "#2D0954",
//                     }}
//                   >
//                     Previous
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
//                     style={{
//                       backgroundColor:
//                         currentPage === totalPages ? "white" : "white",
//                       color: "#2D0954",
//                       borderColor: "#2D0954",
//                     }}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete the course and all its associated
//               data. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete Course"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default CourseManagement;
