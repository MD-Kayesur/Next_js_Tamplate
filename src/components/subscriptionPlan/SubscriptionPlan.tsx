"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Loader2,
  Plus,
  X,
  Trash2,
  Check,
  ChevronDown,
  Edit,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useState, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} from "@/redux/features/auth/planApi";
import { toast } from "sonner";
import { Plan, PlanFormData } from "@/redux/types/venue.type";

import PageLoader from "../AdminPage/Shared/PageLoader";
import Title from "../reuseabelComponents/Title";

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

type PlanFormState = Omit<PlanFormData, "price" | "duration"> & {
  price: number | "";
  duration: number | "";
};

export default function SubscriptionPlanControl() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // RTK Query hooks
  const { data: plans = [], isLoading, isError, refetch } = useGetPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const [newPlan, setNewPlan] = useState<PlanFormState>({
    planName: "",
    description: "",
    price: "",
    duration: "",
    features: [],
  });

  const [validationErrors, setValidationErrors] = useState({
    planName: "",
    price: "",
    duration: "",
  });

  const validateForm = useCallback(() => {
    const errors = {
      planName: "",
      price: "",
      duration: "",
    };
    let isValid = true;

    if (!newPlan.planName.trim()) {
      errors.planName = "Plan name is required";
      isValid = false;
    }

    if (newPlan.price === "" || Number(newPlan.price) <= 0) {
      errors.price = "Price must be greater than 0";
      isValid = false;
    }

    if (newPlan.duration === "" || Number(newPlan.duration) <= 0) {
      errors.duration = "Duration must be greater than 0";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [newPlan.planName, newPlan.price, newPlan.duration]);

  const resetForm = useCallback(() => {
    setNewPlan({
      planName: "",
      description: "",
      price: "",
      duration: "",
      features: [],
    });
    setEditingPlan(null);
    setNewFeature("");
    setValidationErrors({
      planName: "",
      price: "",
      duration: "",
    });
  }, []);

  const handleAddPlan = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const planPayload: PlanFormData = {
        planName: newPlan.planName,
        description: newPlan.description || "",
        price: Number(newPlan.price),
        duration: Number(newPlan.duration),
        features: newPlan.features.filter((f) => f.trim() !== ""),
      };

      await createPlan(planPayload).unwrap();
      toast.success("Plan created successfully");
      resetForm();
      setIsDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error creating plan:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to create plan. Please try again."
      );
    }
  }, [createPlan, newPlan, validateForm, resetForm, refetch]);

  const handleUpdatePlan = useCallback(async () => {
    if (!editingPlan || !validateForm()) return;

    try {
      const planPayload: Partial<PlanFormData> = {
        planName: newPlan.planName,
        description: newPlan.description || "",
        price: Number(newPlan.price),
        duration: Number(newPlan.duration),
        features: newPlan.features.filter((f) => f.trim() !== ""),
      };

      await updatePlan({
        id: editingPlan.subscriptionPlanId,
        data: planPayload,
      }).unwrap();

      toast.success("Plan updated successfully");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Update error:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to update plan. Please try again."
      );
    }
  }, [editingPlan, newPlan, updatePlan, validateForm, resetForm, refetch]);

  const handleDeletePlan = useCallback((id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeletePlan = useCallback(async () => {
    if (!planToDelete) return;

    setIsDeletingPlan(true);
    try {
      await deletePlan(planToDelete).unwrap();
      toast.success("Plan deleted successfully");
      refetch();
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(
        err?.data?.message || err?.message || "Failed to delete plan"
      );
    } finally {
      setIsDeletingPlan(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }, [planToDelete, deletePlan, refetch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name === "price" || name === "duration") {
        setNewPlan((prev) => ({
          ...prev,
          [name]: value === "" ? "" : Number(value),
        }));
      } else {
        setNewPlan((prev) => ({ ...prev, [name]: value }));
      }

      if (validationErrors[name as keyof typeof validationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [validationErrors]
  );

  const addFeature = useCallback(() => {
    if (newFeature.trim()) {
      setNewPlan((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  }, [newFeature]);

  const removeFeature = useCallback((index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }, []);

  const openEditDialog = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setNewPlan({
      planName: plan.planName,
      description: plan.description || "",
      price: plan.price,
      duration: plan.duration,
      features: [...plan.features],
    });
    setIsDialogOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading plans.{" "}
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full font-Robot">
      <div className="flex justify-between items-center mb-8">
        <Title title="Subscription Plan Management" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update the plan details"
                  : "Fill in the details for the new plan"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="planName" className="text-right">
                  Plan Name
                </label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="planName"
                    name="planName"
                    value={newPlan.planName}
                    onChange={handleInputChange}
                    placeholder="e.g. Basic Plan Pro"
                    required
                  />
                  {validationErrors.planName && (
                    <p className="text-sm text-red-500">
                      {validationErrors.planName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={newPlan.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Plan description"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price" className="text-right">
                  Price
                </label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={newPlan.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                    min="0"
                    step="0.01"
                    required
                  />
                  {validationErrors.price && (
                    <p className="text-sm text-red-500">
                      {validationErrors.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="duration" className="text-right">
                  Duration (months)
                </label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={newPlan.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                    min="1"
                    required
                  />
                  {validationErrors.duration && (
                    <p className="text-sm text-red-500">
                      {validationErrors.duration}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="features" className="text-right mt-2">
                  Features
                </label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add feature (e.g. 'Feature 1')"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      variant="outline"
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                    {newPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span>{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {newPlan.features.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No features added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={
                  !newPlan.planName ||
                  newPlan.price === "" ||
                  Number(newPlan.price) <= 0 ||
                  newPlan.duration === "" ||
                  Number(newPlan.duration) <= 0 ||
                  (editingPlan ? isUpdating : isCreating)
                }
              >
                {editingPlan
                  ? isUpdating
                    ? "Updating..."
                    : "Update Plan"
                  : isCreating
                  ? "Creating..."
                  : "Add Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-12 rounded-lg border border-gray-200 bg-white shadow-sm pt-6">
        <h2 className="text-xl mb-4 px-6">All Subscription Plans</h2>
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-300 mt-2 rounded-t-md">
              <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                <TableHead className="w-[100px] px-4 py-3">Plan Name</TableHead>
                <TableHead className="px-4 py-3">Price</TableHead>
                <TableHead className="px-4 py-3">Duration</TableHead>
                <TableHead className="px-4 py-3">Features</TableHead>
                <TableHead className="px-4 py-3">Created</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.subscriptionPlanId}>
                  <TableCell className="font-medium">{plan.planName}</TableCell>
                  <TableCell>${plan.price.toFixed(2)}</TableCell>
                  <TableCell>{plan.duration} months</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 px-2">
                          {plan.features.length} features{" "}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {plan.features.map((feature, index) => (
                          <DropdownMenuItem key={index} className="max-w-xs">
                            {feature}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    {plan.createdAt
                      ? new Date(plan.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right p-4 pr-8">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit"
                        className="text-blue-500 hover:bg-blue-100 cursor-pointer"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete"
                        className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
                        onClick={() =>
                          handleDeletePlan(plan.subscriptionPlanId)
                        }
                        disabled={isDeletingPlan}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Plans Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.subscriptionPlanId}
              className="transition-all hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-xl font-bold">{plan.planName}</div>
                  <div className="text-3xl font-bold mt-2">
                    ${plan.price.toFixed(2)}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {plan.duration} month{plan.duration > 1 ? "s" : ""}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {/* <CardFooter className="mt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Choose Plan
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription plan. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={isDeletingPlan}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              disabled={isDeletingPlan}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeletingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
