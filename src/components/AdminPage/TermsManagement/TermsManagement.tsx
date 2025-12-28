"use client";

import React, { useState } from "react";
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  useGetTermCategoriesQuery,
  useCreateTermCategoryMutation,
  useDeleteTermCategoryMutation,
  useGetKeyPointsByCategoryQuery,
  useCreateKeyPointMutation,
  useDeleteKeyPointMutation,
} from "@/redux/features/auth/termApi";
import { TermCategory } from "@/redux/types/venue.type";
import Title from "@/components/reuseabelComponents/Title";
import PageLoader from "../Shared/PageLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const TermsManagement = () => {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useGetTermCategoriesQuery();

  const [createCategory] = useCreateTermCategoryMutation();
  const [deleteCategory] = useDeleteTermCategoryMutation();
  const [createKeyPoint] = useCreateKeyPointMutation();
  const [deleteKeyPoint] = useDeleteKeyPointMutation();

  const [currentCategory, setCurrentCategory] = useState<Partial<TermCategory>>(
    {
      title: "",
      lastUpdated: format(new Date(), "yyyy-MM-dd"),
    }
  );

  const [currentKeyPoint, setCurrentKeyPoint] = useState<{
    point: string;
    categoryId: string;
  }>({ point: "", categoryId: "" });

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isKeyPointDialogOpen, setIsKeyPointDialogOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "category" | "keyPoint";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch key points for the expanded category
  const { data: keyPoints = [], isLoading: isKeyPointsLoading } =
    useGetKeyPointsByCategoryQuery(expandedCategoryId || "", {
      skip: !expandedCategoryId,
    });

  const handleAddCategory = async () => {
    if (!currentCategory.title) {
      toast.error("Title is required");
      return;
    }

    try {
      await createCategory({
        title: currentCategory.title,
        lastUpdated:
          currentCategory.lastUpdated || format(new Date(), "yyyy-MM-dd"),
      }).unwrap();
      toast.success("Category added successfully");
      resetCategoryForm();
      setIsCategoryDialogOpen(false);
      refetchCategories();
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === "category") {
        await deleteCategory(itemToDelete.id).unwrap();
        toast.success("Category deleted successfully");
        if (expandedCategoryId === itemToDelete.id) {
          setExpandedCategoryId(null);
        }
      } else {
        await deleteKeyPoint(itemToDelete.id).unwrap();
        toast.success("Key point deleted successfully");
      }
      refetchCategories();
    } catch {
      toast.error(
        `Failed to delete ${
          itemToDelete.type === "category" ? "category" : "key point"
        }`
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (id: string, type: "category" | "keyPoint") => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleAddKeyPoint = async () => {
    if (!currentKeyPoint.point || !currentKeyPoint.categoryId) {
      toast.error("Point and category are required");
      return;
    }

    try {
      await createKeyPoint({
        point: currentKeyPoint.point,
        categoryId: currentKeyPoint.categoryId,
      }).unwrap();
      toast.success("Key point added successfully");
      resetKeyPointForm();
      setIsKeyPointDialogOpen(false);
      refetchCategories();
    } catch {
      toast.error("Failed to add key point");
    }
  };

  const resetCategoryForm = () => {
    setCurrentCategory({
      title: "",
      lastUpdated: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const resetKeyPointForm = () => {
    setCurrentKeyPoint({ point: "", categoryId: "" });
  };

  const toggleExpandCategory = (id: string) => {
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  return (
    <div className="w-full mx-auto">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "category"
                ? "This will permanently delete the category and all its key points. This action cannot be undone."
                : "This will permanently delete the key point. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${
                  itemToDelete?.type === "category" ? "Category" : "Key Point"
                }`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Title title="Terms Management" />

          <div className="flex gap-2">
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={resetCategoryForm}
                  className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title*</Label>
                    <Input
                      id="title"
                      value={currentCategory.title}
                      onChange={(e) =>
                        setCurrentCategory({
                          ...currentCategory,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter category title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastUpdated">Last Updated</Label>
                    <Input
                      id="lastUpdated"
                      type="date"
                      value={currentCategory.lastUpdated}
                      onChange={(e) =>
                        setCurrentCategory({
                          ...currentCategory,
                          lastUpdated: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                    onClick={handleAddCategory}
                  >
                    Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isKeyPointDialogOpen}
              onOpenChange={setIsKeyPointDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={resetKeyPointForm}
                  className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add Key Point
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Key Point</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className=" gap-4 py-4">
                    <label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700 text-right"
                    >
                      Category
                    </label>

                    <div className="col-span-3 mt-1 cursor-pointer">
                      <Select
                        value={currentKeyPoint.categoryId}
                        onValueChange={(value) =>
                          setCurrentKeyPoint({
                            ...currentKeyPoint,
                            categoryId: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="category"
                          className="w-full cursor-pointer"
                        >
                          {categories.find(
                            (c) => c.id === currentKeyPoint.categoryId
                          )?.title || "Select a category"}
                        </SelectTrigger>
                        <SelectContent className="cursorer-pointer">
                          <SelectItem value="">Select a category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="point">Key Point</Label>
                    <Textarea
                      id="point"
                      value={currentKeyPoint.point}
                      onChange={(e) =>
                        setCurrentKeyPoint({
                          ...currentKeyPoint,
                          point: e.target.value,
                        })
                      }
                      placeholder="Enter key point"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                    variant="outline"
                    onClick={() => setIsKeyPointDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                    onClick={handleAddKeyPoint}
                  >
                    Add Key Point
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-normal">
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCategoriesLoading ? (
              <div className="text-center py-12">
                <PageLoader />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FiPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-medium">No categories yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first category.
                </p>
                <Button
                  className="mt-6"
                  onClick={() => setIsCategoryDialogOpen(true)}
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
                  <TableRow>
                    <TableHead className="w-[60%] px-4 py-3">Title</TableHead>
                    <TableHead className="px-4 py-3">Last Updated</TableHead>
                    <TableHead className="px-4 py-3">Key Points</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      <TableRow>
                        <TableCell className="font-medium">
                          {category.title}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(category.lastUpdated),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell>{category.keyPoints?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() =>
                                openDeleteDialog(category.id, "category")
                              }
                              variant="outline"
                              size="sm"
                              title="Delete"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleExpandCategory(category.id)}
                            >
                              {expandedCategoryId === category.id ? (
                                <FiChevronUp className="h-4 w-4" />
                              ) : (
                                <FiChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedCategoryId === category.id && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <div className="p-4 bg-muted/50 rounded-md">
                              <div className="mb-4">
                                <h4 className="font-medium mb-2">Key Points</h4>
                                {isKeyPointsLoading ? (
                                  <div>Loading key points...</div>
                                ) : keyPoints.length > 0 ? (
                                  <ul className="space-y-2">
                                    {keyPoints.map((point) => (
                                      <li
                                        key={point.id}
                                        className="flex justify-between items-center p-2 bg-white rounded"
                                      >
                                        <span className="flex-1 text-sm text-gray-800 break-words whitespace-pre-wrap">
                                          {point.point}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          title="Delete"
                                          className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                          onClick={() =>
                                            openDeleteDialog(
                                              point.id,
                                              "keyPoint"
                                            )
                                          }
                                        >
                                          <FiTrash2 className="h-4 w-4" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No key points yet
                                  </p>
                                )}
                              </div>
                              <div className="mt-3 text-xs text-muted-foreground">
                                Created:{" "}
                                {format(new Date(category.createdAt), "PPP")}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsManagement;

// "use client";

// import React, { useState } from "react";
// import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { format } from "date-fns";
// import { toast } from "sonner";

// import {
//   useGetTermCategoriesQuery,
//   useCreateTermCategoryMutation,
//   useDeleteTermCategoryMutation,
//   useGetKeyPointsByCategoryQuery,
//   useCreateKeyPointMutation,
//   useDeleteKeyPointMutation,
// } from "@/redux/features/auth/termApi";
// import { TermCategory } from "@/redux/types/venue.type";
// import Title from "@/components/reuseabelComponents/Title";
// import PageLoader from "../Shared/PageLoader";

// const TermsManagement = () => {
//   const {
//     data: categories = [],
//     isLoading: isCategoriesLoading,
//     refetch: refetchCategories,
//   } = useGetTermCategoriesQuery();

//   const [createCategory] = useCreateTermCategoryMutation();
//   const [deleteCategory] = useDeleteTermCategoryMutation();
//   const [createKeyPoint] = useCreateKeyPointMutation();
//   const [deleteKeyPoint] = useDeleteKeyPointMutation();

//   const [currentCategory, setCurrentCategory] = useState<Partial<TermCategory>>(
//     {
//       title: "",
//       lastUpdated: format(new Date(), "yyyy-MM-dd"),
//     }
//   );

//   const [currentKeyPoint, setCurrentKeyPoint] = useState<{
//     point: string;
//     categoryId: string;
//   }>({ point: "", categoryId: "" });

//   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
//   const [isKeyPointDialogOpen, setIsKeyPointDialogOpen] = useState(false);
//   const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
//     null
//   );

//   // Fetch key points for the expanded category
//   const { data: keyPoints = [], isLoading: isKeyPointsLoading } =
//     useGetKeyPointsByCategoryQuery(expandedCategoryId || "", {
//       skip: !expandedCategoryId,
//     });

//   const handleAddCategory = async () => {
//     if (!currentCategory.title) {
//       toast.error("Title is required");
//       return;
//     }

//     try {
//       await createCategory({
//         title: currentCategory.title,
//         lastUpdated:
//           currentCategory.lastUpdated || format(new Date(), "yyyy-MM-dd"),
//       }).unwrap();
//       toast.success("Category added successfully");
//       resetCategoryForm();
//       setIsCategoryDialogOpen(false);
//       refetchCategories();
//     } catch {
//       // error parameter removed to fix ESLint no-unused-vars error
//       toast.error("Failed to add category");
//     }
//   };

//   const handleDeleteCategory = async (id: string) => {
//     try {
//       await deleteCategory(id).unwrap();
//       toast.success("Category deleted successfully");
//       refetchCategories();
//       if (expandedCategoryId === id) {
//         setExpandedCategoryId(null);
//       }
//     } catch {
//       // error parameter removed to fix ESLint no-unused-vars error
//       toast.error("Failed to delete category");
//     }
//   };

//   const handleAddKeyPoint = async () => {
//     if (!currentKeyPoint.point || !currentKeyPoint.categoryId) {
//       toast.error("Point and category are required");
//       return;
//     }

//     try {
//       await createKeyPoint({
//         point: currentKeyPoint.point,
//         categoryId: currentKeyPoint.categoryId,
//       }).unwrap();
//       toast.success("Key point added successfully");
//       resetKeyPointForm();
//       setIsKeyPointDialogOpen(false);
//       refetchCategories();
//     } catch {
//       // error parameter removed to fix ESLint no-unused-vars error
//       toast.error("Failed to add key point");
//     }
//   };

//   const handleDeleteKeyPoint = async (id: string) => {
//     try {
//       await deleteKeyPoint(id).unwrap();
//       toast.success("Key point deleted successfully");
//       refetchCategories();
//     } catch {
//       // error parameter removed to fix ESLint no-unused-vars error
//       toast.error("Failed to delete key point");
//     }
//   };

//   const resetCategoryForm = () => {
//     setCurrentCategory({
//       title: "",
//       lastUpdated: format(new Date(), "yyyy-MM-dd"),
//     });
//   };

//   const resetKeyPointForm = () => {
//     setCurrentKeyPoint({ point: "", categoryId: "" });
//   };

//   const toggleExpandCategory = (id: string) => {
//     setExpandedCategoryId(expandedCategoryId === id ? null : id);
//   };

//   return (
//     <div className="w-full mx-auto ">
//       <div className="flex flex-col space-y-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <Title title="Terms Management" />

//           <div className="flex gap-2">
//             <Dialog
//               open={isCategoryDialogOpen}
//               onOpenChange={setIsCategoryDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button
//                   onClick={resetCategoryForm}
//                   className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//                 >
//                   <FiPlus className="h-4 w-4 mr-2" />
//                   Add Category
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Category</DialogTitle>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="title">Title*</Label>
//                     <Input
//                       id="title"
//                       value={currentCategory.title}
//                       onChange={(e) =>
//                         setCurrentCategory({
//                           ...currentCategory,
//                           title: e.target.value,
//                         })
//                       }
//                       placeholder="Enter category title"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="lastUpdated">Last Updated</Label>
//                     <Input
//                       id="lastUpdated"
//                       type="date"
//                       value={currentCategory.lastUpdated}
//                       onChange={(e) =>
//                         setCurrentCategory({
//                           ...currentCategory,
//                           lastUpdated: e.target.value,
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
//                     variant="outline"
//                     onClick={() => setIsCategoryDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//                     onClick={handleAddCategory}
//                   >
//                     Add Category
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>

//             <Dialog
//               open={isKeyPointDialogOpen}
//               onOpenChange={setIsKeyPointDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button
//                   onClick={resetKeyPointForm}
//                   className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//                 >
//                   <FiPlus className="h-4 w-4 mr-2" />
//                   Add Key Point
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Key Point</DialogTitle>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="category">Category*</Label>
//                     <select
//                       id="category"
//                       value={currentKeyPoint.categoryId}
//                       onChange={(e) =>
//                         setCurrentKeyPoint({
//                           ...currentKeyPoint,
//                           categoryId: e.target.value,
//                         })
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select a category</option>
//                       {categories.map((category) => (
//                         <option key={category.id} value={category.id}>
//                           {category.title}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="point">Key Point*</Label>
//                     <Textarea
//                       id="point"
//                       value={currentKeyPoint.point}
//                       onChange={(e) =>
//                         setCurrentKeyPoint({
//                           ...currentKeyPoint,
//                           point: e.target.value,
//                         })
//                       }
//                       placeholder="Enter key point"
//                       className="min-h-[100px]"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
//                     variant="outline"
//                     onClick={() => setIsKeyPointDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
//                     onClick={handleAddKeyPoint}
//                   >
//                     Add Key Point
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl font-normal">
//               Terms and Conditions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isCategoriesLoading ? (
//               <div className="text-center py-12">
//                 {" "}
//                 <PageLoader />{" "}
//               </div>
//             ) : categories.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
//                   <FiPlus className="h-5 w-5 text-muted-foreground" />
//                 </div>
//                 <h3 className="mt-4 text-sm font-medium">No categories yet</h3>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   Get started by adding your first category.
//                 </p>
//                 <Button
//                   className="mt-6"
//                   onClick={() => setIsCategoryDialogOpen(true)}
//                 >
//                   <FiPlus className="h-4 w-4 mr-2" />
//                   Add Category
//                 </Button>
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
//                   <TableRow>
//                     <TableHead className="w-[60%] px-4 py-3">Title</TableHead>
//                     <TableHead className="px-4 py-3">Last Updated</TableHead>
//                     <TableHead className="px-4 py-3">Key Points</TableHead>
//                     <TableHead className="px-4 py-3 text-right">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {categories.map((category) => (
//                     <React.Fragment key={category.id}>
//                       <TableRow>
//                         <TableCell className="font-medium">
//                           {category.title}
//                         </TableCell>
//                         <TableCell>
//                           {format(
//                             new Date(category.lastUpdated),
//                             "MMM dd, yyyy"
//                           )}
//                         </TableCell>
//                         <TableCell>{category.keyPoints?.length || 0}</TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               onClick={() => handleDeleteCategory(category.id)}
//                               variant="outline"
//                               size="sm"
//                               title="Delete"
//                               className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
//                             >
//                               <FiTrash2 className="h-4 w-4 text-red-400" />
//                             </Button>
//                             <Button
//                               className="cursor-pointer"
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => toggleExpandCategory(category.id)}
//                             >
//                               {expandedCategoryId === category.id ? (
//                                 <FiChevronUp className="h-4 w-4" />
//                               ) : (
//                                 <FiChevronDown className="h-4 w-4" />
//                               )}
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                       {expandedCategoryId === category.id && (
//                         <TableRow>
//                           <TableCell colSpan={4}>
//                             <div className="p-4 bg-muted/50 rounded-md">
//                               <div className="mb-4">
//                                 <h4 className="font-medium mb-2">Key Points</h4>
//                                 {isKeyPointsLoading ? (
//                                   <div>Loading key points...</div>
//                                 ) : keyPoints.length > 0 ? (
//                                   <ul className="space-y-2">
//                                     {keyPoints.map((point) => (
//                                       <li
//                                         key={point.id}
//                                         className="flex justify-between items-center p-2 bg-white rounded "
//                                       >
//                                         <span className="flex-1 text-sm text-gray-800 break-words whitespace-pre-wrap">
//                                           {point.point}
//                                         </span>
//                                         <Button
//                                           variant="outline"
//                                           size="sm"
//                                           title="Delete"
//                                           className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
//                                           onClick={() =>
//                                             handleDeleteKeyPoint(point.id)
//                                           }
//                                         >
//                                           <FiTrash2 className="h-4 w-4 text-red-500" />
//                                         </Button>
//                                       </li>
//                                     ))}
//                                   </ul>
//                                 ) : (
//                                   <p className="text-sm text-muted-foreground">
//                                     No key points yet
//                                   </p>
//                                 )}
//                               </div>
//                               <div className="mt-3 text-xs text-muted-foreground">
//                                 Created:{" "}
//                                 {format(new Date(category.createdAt), "PPP")}
//                               </div>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default TermsManagement;
