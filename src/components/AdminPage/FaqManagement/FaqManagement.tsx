"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

// Redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import {
  setCurrentFaq,
  openFaqDialog,
  openCategoryDialog,
  resetFaqState,
} from "@/redux/features/auth/faqSlice";
import {
  useCreateFaqCategoryMutation,
  useCreateFaqMutation,
  useDeleteFaqCategoryMutation,
  useDeleteFaqMutation,
  useGetFaqCategoriesQuery,
  useGetFaqsQuery,
  useUpdateFaqMutation,
} from "@/redux/features/auth/faqApi";

// Types
import { FAQ, FAQCategory } from "@/redux/types/venue.type";
import Title from "@/components/reuseabelComponents/Title";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";

// Zod schema for form validation
const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  categoryName: z.string().optional(),
});

type FormData = z.infer<typeof faqSchema>;

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  as?: React.ElementType;
  rows?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  error,
  as: Component = Input,
  ...props
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <Component
      id={id}
      className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
      {...props}
    />
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

export default function FaqManagementDashboard() {
  const dispatch = useAppDispatch();
  const { currentFaq, isDialogOpen } = useAppSelector((state) => state.faq);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "faq" | "category";
  } | null>(null);

  // API hooks
  const {
    data: faqs = [],
    isLoading: isFaqsLoading,
    refetch: refetchFaqs,
  } = useGetFaqsQuery();
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useGetFaqCategoriesQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();
  const [deleteFaqCategory] = useDeleteFaqCategoryMutation();
  const [createFaqCategory, { isLoading: isCreatingCategory }] =
    useCreateFaqCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      categoryId: "",
      categoryName: "",
    },
  });

  useEffect(() => {
    if (currentFaq) {
      setValue("question", currentFaq.question);
      setValue("answer", currentFaq.answer);
      setValue("categoryId", currentFaq.categoryId);
    } else if (categories.length > 0 && !watch("categoryId")) {
      setValue("categoryId", categories[0].id);
    }
  }, [currentFaq, categories, setValue, watch]);

  const onSubmit = async (data: FormData) => {
    try {
      const { categoryName, ...faqData } = data;

      if (currentFaq) {
        await updateFaq({
          id: currentFaq.id,
          data: faqData,
        }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await createFaq(faqData).unwrap();
        toast.success("FAQ created successfully");
      }

      reset();
      dispatch(resetFaqState());
      refetchFaqs();
    } catch (error) {
      toast.error(
        `Failed to ${currentFaq ? "update" : "create"} FAQ. Please try again.`
      );
      console.error("Submission error:", error);
    }
  };

  const handleCreateCategory = async () => {
    const categoryName = watch("categoryName");
    if (!categoryName?.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      await createFaqCategory({ name: categoryName }).unwrap();
      toast.success("Category created successfully");
      setValue("categoryName", "");
      refetchCategories();
    } catch (error) {
      toast.error("Failed to create category. Please try again.");
      console.error("Category creation error:", error);
    } finally {
      dispatch(openCategoryDialog(false));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === "faq") {
        await deleteFaq(itemToDelete.id).unwrap();
        toast.success("FAQ deleted successfully");
        refetchFaqs();
      } else {
        await deleteFaqCategory(itemToDelete.id).unwrap();
        toast.success("Category deleted successfully");
        refetchCategories();
        refetchFaqs();
      }
    } catch (error) {
      toast.error(
        `Failed to delete ${
          itemToDelete.type === "faq" ? "FAQ" : "category"
        }. Please try again.`
      );
      console.error("Deletion error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (id: string, type: "faq" | "category") => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (faq: FAQ) => {
    dispatch(setCurrentFaq(faq));
    dispatch(openFaqDialog(true));
  };

  const openCreateDialog = () => {
    dispatch(setCurrentFaq(null));
    reset();
    dispatch(openFaqDialog(true));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title title="FAQ Management" />
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => dispatch(openCategoryDialog(true))}
            className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
          >
            <FiPlus className="h-4 w-4" />
            Add Category
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "faq"
                ? "This will permanently delete the FAQ. This action cannot be undone."
                : "This will permanently delete the category and all its FAQs. This action cannot be undone."}
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
                `Delete ${itemToDelete?.type === "faq" ? "FAQ" : "Category"}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="">
        <div className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden ">
            {/* FAQs Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl text-gray-900">FAQ </h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
                    <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                      <TableHead className="w-[30%] px-6 py-3 ">
                        Question
                      </TableHead>
                      <TableHead className="w-[40%] px-6 py-3 ">
                        Answer
                      </TableHead>
                      <TableHead className="w-[15%] px-6 py-3 ">
                        Category
                      </TableHead>
                      <TableHead className="w-[10%] px-6 py-3 ">
                        Updated
                      </TableHead>
                      <TableHead className="w-[5%] px-6 py-3 ">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFaqsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell colSpan={5} className="px-6 py-4">
                            <Skeleton className="h-10 w-full rounded-md" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : faqs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No FAQs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      faqs.map((faq: FAQ) => {
                        const category = categories.find(
                          (c: FAQCategory) => c.id === faq.categoryId
                        );

                        return (
                          <TableRow key={faq.id} className="hover:bg-gray-50">
                            <TableCell className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                              {faq.question}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-muted-foreground text-sm line-clamp-2 max-w-xs">
                              {faq.answer}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline">
                                {category ? category.name : "Uncategorized"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(faq.updatedAt)}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                className="cursor-pointer text-gray-700 border-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                                variant="outline"
                                size="sm"
                                title="Edit"
                                onClick={() => openEditDialog(faq)}
                              >
                                <FiEdit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                title="Delete"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                onClick={() => openDeleteDialog(faq.id, "faq")}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Categories Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl  text-gray-900">Categories</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
                    <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                      <TableHead className="w-[60%] px-6 py-3 ">Name</TableHead>
                      <TableHead className="w-[25%] px-6 py-3 ">
                        Created
                      </TableHead>
                      <TableHead className="w-[15%] px-6 py-3 ">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCategoriesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`category-skeleton-${i}`}>
                          <TableCell colSpan={3} className="px-6 py-4">
                            <Skeleton className="h-10 w-full rounded-md" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No categories found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category: FAQCategory) => (
                        <TableRow
                          key={category.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="px-6 py-4 font-medium text-gray-900">
                            {category.name}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(category.createdAt)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                              onClick={() =>
                                openDeleteDialog(category.id, "category")
                              }
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Dialog */}
        <Dialog
          open={isDialogOpen.faq}
          onOpenChange={(open) => {
            if (!open) dispatch(resetFaqState());
            dispatch(openFaqDialog(open));
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentFaq ? "Edit FAQ" : "Create New FAQ"}
              </DialogTitle>
              <DialogDescription>
                {currentFaq
                  ? "Update the FAQ details below."
                  : "Fill out the form to add a new FAQ."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 py-4">
                <FormInput
                  id="question"
                  label="Question"
                  placeholder="How do I..."
                  {...register("question")}
                  error={errors.question?.message}
                />
                <FormInput
                  as={Textarea}
                  id="answer"
                  label="Answer"
                  placeholder="Detailed answer..."
                  rows={6}
                  {...register("answer")}
                  error={errors.answer?.message}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(value: string) =>
                        setValue("categoryId", value)
                      }
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: FAQCategory) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        dispatch(openFaqDialog(false));
                        dispatch(openCategoryDialog(true));
                      }}
                      className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatch(openFaqDialog(false))}
                  className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentFaq ? "Update FAQ" : "Create FAQ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog
          open={isDialogOpen.category}
          onOpenChange={(open) => dispatch(openCategoryDialog(open))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your FAQs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 py-1">
                <FormInput
                  id="categoryName"
                  label="Category Name"
                  placeholder="e.g., Billing, Technical"
                  value={watch("categoryName")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValue("categoryName", e.target.value)
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatch(openCategoryDialog(false))}
                  className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory}
                  className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
                >
                  {isCreatingCategory && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Category
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
