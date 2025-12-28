"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

import {
  useCreateModuleMutation,
  useGetModulesByCourseQuery,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} from "@/redux/features/auth/moduleApi";
import {
  setModules,
  setLoading,
  setError,
  setCurrentModule,
  setSearchTerm,
  setSortConfig,
} from "@/redux/features/auth/moduleSlice";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";

import Title from "@/components/reuseabelComponents/Title";
import { IModule } from "@/redux/types/venue.type";
import { useGetCoursesQuery } from "@/redux/features/auth/courseApi";
import PageLoader from "../Shared/PageLoader";

interface ModuleManagementProps {
  courseId?: string; // Make it optional if needed
}

const ModuleManagement = ({ courseId }: ModuleManagementProps) => {
  const dispatch = useAppDispatch();
  const { modules, error, currentModule, searchTerm, sortConfig } =
    useAppSelector((state) => state.module);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);

  // API hooks with proper error handling
  const { data: courses, isLoading: isCoursesLoading } = useGetCoursesQuery();

  const {
    data: fetchedModules,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useGetModulesByCourseQuery(courseId || "");

  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation();
  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation();
  const [deleteModule, { isLoading: isDeleting }] = useDeleteModuleMutation();

  // Fetch modules when courseId changes
  useEffect(() => {
    if (fetchedModules) {
      dispatch(setModules(fetchedModules));
    }
  }, [fetchedModules, dispatch]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      console.error("Error fetching modules:", fetchError);
      if ("data" in fetchError) {
        dispatch(
          setError(
            (fetchError.data as { message: string })?.message ||
              "Failed to fetch modules"
          )
        );
      } else {
        dispatch(setError("Failed to fetch modules"));
      }
    }
  }, [fetchError, dispatch]);

  const handleSort = (field: keyof IModule) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    dispatch(setSortConfig({ field, direction }));
  };

  const sortedModules = [...modules].sort((a, b) => {
    const aValue = a[sortConfig.field] ?? "";
    const bValue = b[sortConfig.field] ?? "";

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // const filteredModules = sortedModules.filter(
  //   (module) =>
  //     module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     module.description.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (currentModule) {
      dispatch(
        setCurrentModule({
          ...currentModule,
          [name]: value,
        })
      );
    }
  };

  const handleCourseIdChange = (value: string) => {
    if (currentModule) {
      dispatch(
        setCurrentModule({
          ...currentModule,
          courseId: value,
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule) return;

    try {
      dispatch(setLoading(true));

      if (currentModule.id) {
        // Update existing module
        const { id, ...updateData } = currentModule;
        await updateModule({ id, data: updateData }).unwrap();
        toast.success("Module updated successfully");
      } else {
        // Create new module
        const newModule = {
          title: currentModule.title,
          description: currentModule.description,
          courseId: currentModule.courseId, // Use the selected courseId
        };

        if (!newModule.courseId) {
          toast.error("Please select a course");
          return;
        }

        await createModule(newModule).unwrap();
        toast.success("Module created successfully");
      }

      setIsModalOpen(false);
      dispatch(setCurrentModule(null));
      refetch(); // Refresh the list after mutation
    } catch (err) {
      console.error("Error saving module:", err);
      toast.error("Failed to save module");
      dispatch(setError("Failed to save module"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEdit = (module: IModule) => {
    dispatch(setCurrentModule(module));
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setModuleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!moduleToDelete) return;

    try {
      dispatch(setLoading(true));
      await deleteModule(moduleToDelete).unwrap();
      toast.success("Module deleted successfully");
      refetch(); // Refresh the list after deletion
    } catch (err) {
      console.error("Error deleting module:", err);
      toast.error("Failed to delete module");
      dispatch(setError("Failed to delete module"));
    } finally {
      setIsDeleteDialogOpen(false);
      setModuleToDelete(null);
      dispatch(setLoading(false));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIndicator = (field: keyof IModule) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Combined loading state
  const isProcessing =
    isCoursesLoading || isCreating || isUpdating || isDeleting || isFetching;

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Title title="Module Management" />
        </div>
        <Button
          className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
          onClick={() => {
            dispatch(
              setCurrentModule({
                id: "",
                title: "",
                description: "",
                courseId: courseId || "", // Initialize with prop or empty
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                contents: [],
              })
            );
            setIsModalOpen(true);
          }}
          disabled={isProcessing}
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search modules..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              disabled={isProcessing}
            />
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-destructive">
            <p>{error}</p>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => refetch()}
              disabled={isProcessing}
            >
              Retry
            </Button>
          </div>
        ) : isProcessing && modules.length === 0 ? (
          <div className="p-6 space-y-4">
            {/* {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))} */}
            <PageLoader />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
              <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                <TableHead
                  className="cursor-pointer px-4 py-3"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Title
                    <span className="ml-1">{getSortIndicator("title")}</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3">Description</TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created
                    <span className="ml-1">
                      {getSortIndicator("createdAt")}
                    </span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(courses ?? []).length > 0 ? (
                (courses ?? []).map((course) =>
                  (course.modules ?? []).map((module) => (
                    <TableRow key={module.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium font-sans">
                        {module.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground line-clamp-2 max-w-xs">
                        {module.description}
                      </TableCell>
                      <TableCell>{formatDate(module.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            className=" cursor-pointer "
                            variant="outline"
                            size="sm"
                            title="Edit"
                            onClick={() => handleEdit(module)}
                            disabled={isProcessing}
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Delete"
                            className="text-red-500 hover:bg-red-100 cursor-pointer"
                            onClick={() => handleDeleteClick(module.id)}
                            disabled={isProcessing}
                          >
                            <FiTrash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <FiSearch className="h-12 w-12 text-muted-foreground/30 mb-2" />
                      <p>No modules found</p>
                      {searchTerm && (
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => dispatch(setSearchTerm(""))}
                          disabled={isProcessing}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Module Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentModule?.id ? "Edit Module" : "Create New Module"}
            </DialogTitle>
          </DialogHeader>
          {currentModule && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Module Title </Label>
                <Input
                  id="title"
                  name="title"
                  value={currentModule.title}
                  onChange={handleInputChange}
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentModule.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="courseId"
                  className="text-sm font-medium text-gray-700"
                >
                  Select Course
                </Label>
                <Select
                  value={currentModule.courseId}
                  onValueChange={handleCourseIdChange}
                  disabled={!!currentModule.id || isProcessing}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 cursor-pointer">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {courses?.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={course.id}
                        className="hover:bg-blue-100"
                      >
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : currentModule.id
                    ? "Update Module"
                    : "Create Module"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this module? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModuleManagement;

// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import {
//   FiEdit,
//   FiTrash2,
//   FiPlus,
//   FiSearch,
//   FiX,
//   FiCheck,
// } from "react-icons/fi";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
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
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import Title from "@/components/reuseabelComponents/Title";

// interface Module {
//   id: string;
//   title: string;
//   description: string;
//   courseId: string;
//   courseTitle?: string;
//   createdAt: string;
//   isActive: boolean;
// }

// type SortField = "title" | "createdAt" | "courseTitle";
// type SortDirection = "asc" | "desc";

// const ModuleManagement = () => {
//   const [modules, setModules] = useState<Module[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
//   const [currentModule, setCurrentModule] = useState<Module | null>(null);
//   const [sortConfig, setSortConfig] = useState<{
//     field: SortField;
//     direction: SortDirection;
//   }>({ field: "createdAt", direction: "desc" });

//   // Mock API fetch
//   useEffect(() => {
//     const fetchModules = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         // Simulate API call
//         await new Promise((resolve) => setTimeout(resolve, 800));

//         const mockData: Module[] = [
//           {
//             id: "1",
//             title: "Mindful Awakening",
//             description:
//               "Start your day with breathwork, gratitude, and gentle awareness.",
//             courseId: "morning-001",
//             courseTitle: "Morning Meditation",
//             createdAt: "2025-06-01T07:00:00Z",
//             isActive: true,
//           },
//           {
//             id: "2",
//             title: "Vision Crafting",
//             description:
//               "Learn to visualize your goals and manifest through focused intention.",
//             courseId: "manifest-001",
//             courseTitle: "Manifestation Mastery",
//             createdAt: "2025-06-05T08:00:00Z",
//             isActive: true,
//           },
//           {
//             id: "3",
//             title: "Embrace Your Worth",
//             description:
//               "Develop self-love through affirmation, reflection, and healing practices.",
//             courseId: "selflove-001",
//             courseTitle: "Self Love Journey",
//             createdAt: "2025-06-10T09:00:00Z",
//             isActive: true,
//           },
//           {
//             id: "4",
//             title: "Energetic Alignment",
//             description:
//               "Deep dive into vibrational alignment for powerful manifestation.",
//             courseId: "adv-manifest-001",
//             courseTitle: "Advanced Manifestation",
//             createdAt: "2025-06-15T10:00:00Z",
//             isActive: false,
//           },
//         ];

//         setModules(mockData);
//       } catch (err) {
//         setError("Failed to load modules. Please try again later.");
//         toast.error("Failed to load modules");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchModules();
//   }, []);

//   const handleSort = (field: SortField) => {
//     let direction: SortDirection = "asc";
//     if (sortConfig.field === field && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ field, direction });
//   };

//   const sortedModules = [...modules].sort((a, b) => {
//     const aValue = a[sortConfig.field] ?? "";
//     const bValue = b[sortConfig.field] ?? "";

//     if (aValue < bValue) {
//       return sortConfig.direction === "asc" ? -1 : 1;
//     }
//     if (aValue > bValue) {
//       return sortConfig.direction === "asc" ? 1 : -1;
//     }
//     return 0;
//   });

//   const filteredModules = sortedModules.filter(
//     (module) =>
//       module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (module.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ??
//         false)
//   );

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setCurrentModule((prev) => ({
//       ...prev!,
//       [name]: value,
//     }));
//   };

//   const handleStatusChange = (value: string) => {
//     setCurrentModule((prev) => ({
//       ...prev!,
//       isActive: value === "true",
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       if (currentModule?.id) {
//         // Update existing module
//         setModules(
//           modules.map((module) =>
//             module.id === currentModule.id ? currentModule : module
//           )
//         );
//         toast.success("Module updated successfully");
//       } else {
//         // Add new module
//         const newModule: Module = {
//           ...currentModule!,
//           id: Date.now().toString(),
//           createdAt: new Date().toISOString(),
//           isActive: true,
//         };
//         setModules([newModule, ...modules]);
//         toast.success("Module created successfully");
//       }

//       setIsModalOpen(false);
//       setCurrentModule(null);
//     } catch (err) {
//       toast.error("Failed to save module");
//     }
//   };

//   const handleEdit = (module: Module) => {
//     setCurrentModule(module);
//     setIsModalOpen(true);
//   };

//   const handleDeleteClick = (id: string) => {
//     setModuleToDelete(id);
//     setIsDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!moduleToDelete) return;

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 300));

//       setModules(modules.filter((module) => module.id !== moduleToDelete));
//       toast.success("Module deleted successfully");
//     } catch (err) {
//       toast.error("Failed to delete module");
//     } finally {
//       setIsDeleteDialogOpen(false);
//       setModuleToDelete(null);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const getSortIndicator = (field: SortField) => {
//     if (sortConfig.field !== field) return null;
//     return sortConfig.direction === "asc" ? "↑" : "↓";
//   };

//   return (
//     <div className="w-full mx-auto space-y-6 ">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <Title title=" Module Management" />
//         </div>
//         <Button
//           className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//           onClick={() => {
//             setCurrentModule({
//               id: "",
//               title: "",
//               description: "",
//               courseId: "",
//               createdAt: "",
//               isActive: true,
//             });
//             setIsModalOpen(true);
//           }}
//         >
//           <FiPlus className="mr-2 h-4 w-4" />
//           Add Module
//         </Button>
//       </div>

//       <div className="rounded-lg border bg-card shadow-sm">
//         <div className="p-4 border-b">
//           <div className="relative max-w-md">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FiSearch className="h-4 w-4 text-muted-foreground" />
//             </div>
//             <Input
//               type="text"
//               placeholder="Search modules..."
//               className="pl-10"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         {error ? (
//           <div className="p-6 text-center text-destructive">
//             <p>{error}</p>
//             <Button
//               variant="ghost"
//               className="mt-2"
//               onClick={() => window.location.reload()}
//             >
//               Retry
//             </Button>
//           </div>
//         ) : isLoading ? (
//           <div className="p-6 space-y-4">
//             {[...Array(5)].map((_, i) => (
//               <Skeleton key={i} className="h-16 w-full rounded-md" />
//             ))}
//           </div>
//         ) : (
//           <Table>
//             <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
//               <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
//                 <TableHead
//                   className="cursor-pointer px-4 py-3"
//                   onClick={() => handleSort("title")}
//                 >
//                   <div className="flex items-center">
//                     Title
//                     <span className="ml-1">{getSortIndicator("title")}</span>
//                   </div>
//                 </TableHead>
//                 <TableHead className="px-4 py-3">Description</TableHead>
//                 <TableHead
//                   className="cursor-pointer px-4 py-3"
//                   onClick={() => handleSort("courseTitle")}
//                 >
//                   <div className="flex items-center">
//                     Course
//                     <span className="ml-1">
//                       {getSortIndicator("courseTitle")}
//                     </span>
//                   </div>
//                 </TableHead>
//                 <TableHead
//                   className="cursor-pointer px-4 py-3"
//                   onClick={() => handleSort("createdAt")}
//                 >
//                   <div className="flex items-center">
//                     Created
//                     <span className="ml-1">
//                       {getSortIndicator("createdAt")}
//                     </span>
//                   </div>
//                 </TableHead>
//                 <TableHead className="px-4 py-3">Status</TableHead>
//                 <TableHead className="px-4 py-3 text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredModules.length > 0 ? (
//                 filteredModules.map((module) => (
//                   <TableRow key={module.id} className="hover:bg-muted/50">
//                     <TableCell className="font-medium">
//                       {module.title}
//                     </TableCell>
//                     <TableCell className="text-muted-foreground line-clamp-2 max-w-xs">
//                       {module.description}
//                     </TableCell>
//                     <TableCell>
//                       {module.courseTitle || module.courseId}
//                     </TableCell>
//                     <TableCell>{formatDate(module.createdAt)}</TableCell>
//                     <TableCell>
//                       <Badge
//                         className={`cursor-pointer px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
//                           module.isActive
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-red-100 text-red-700 hover:bg-red-200"
//                         }`}
//                         onClick={() =>
//                           handleEdit({ ...module, isActive: !module.isActive })
//                         }
//                       >
//                         {module.isActive ? (
//                           <>
//                             <FiCheck className="h-3 w-3" />
//                             Active
//                           </>
//                         ) : (
//                           <>
//                             <FiX className="h-3 w-3" />
//                             Inactive
//                           </>
//                         )}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button
//                           className="cursor-pointer text-gray-700 border-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
//                           variant="outline"
//                           size="sm"
//                           title="Edit"
//                           onClick={() => handleEdit(module)}
//                         >
//                           <FiEdit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           title="Delete"
//                           className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
//                           onClick={() => handleDeleteClick(module.id)}
//                         >
//                           <FiTrash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="h-24 text-center text-muted-foreground"
//                   >
//                     <div className="flex flex-col items-center justify-center py-8">
//                       <FiSearch className="h-12 w-12 text-muted-foreground/30 mb-2" />
//                       <p>No modules found</p>
//                       {searchTerm && (
//                         <Button
//                           variant="link"
//                           className="mt-2"
//                           onClick={() => setSearchTerm("")}
//                         >
//                           Clear search
//                         </Button>
//                       )}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         )}
//       </div>

//       {/* Add/Edit Module Dialog */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {currentModule?.id ? "Edit Module" : "Create New Module"}
//             </DialogTitle>
//           </DialogHeader>
//           {currentModule && (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Module Title *</Label>
//                 <Input
//                   id="title"
//                   name="title"
//                   value={currentModule.title}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="description">Description *</Label>
//                 <Textarea
//                   id="description"
//                   name="description"
//                   value={currentModule.description}
//                   onChange={handleInputChange}
//                   rows={4}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="courseId">Course ID *</Label>
//                   <Input
//                     id="courseId"
//                     name="courseId"
//                     value={currentModule.courseId}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>

//                 {currentModule.id && (
//                   <div>
//                     <Label htmlFor="status">Status</Label>
//                     <Select
//                       value={currentModule.isActive ? "true" : "false"}
//                       onValueChange={handleStatusChange}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="true">Active</SelectItem>
//                         <SelectItem value="false">Inactive</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsModalOpen(false)}
//                   className="border border-[var(--color-blueOne)] bg-transparent text-[var(--color-blueOne)] hover:bg-[var(--color-blueOne)] hover:text-white transition-colors duration-200"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] hover:text-white text-white transition-colors duration-200"
//                 >
//                   {currentModule.id ? "Update Module" : "Create Module"}
//                 </Button>
//               </div>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog
//         open={isDeleteDialogOpen}
//         onOpenChange={setIsDeleteDialogOpen}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Module</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this module? This action cannot be
//               undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDeleteConfirm}
//               className="bg-destructive hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ModuleManagement;
