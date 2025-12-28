import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { planApi } from "@/redux/features/auth/planApi";
import { Plan } from "@/redux/types/venue.type";

interface PlanState {
  plans: Plan[];
  selectedPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  message: string;
}

const initialState: PlanState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  error: null,
  isSuccess: false,
  message: "",
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    resetPlanState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.isSuccess = false;
      state.message = "";
      state.selectedPlan = null;
    },
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(planApi.endpoints.getPlans.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        planApi.endpoints.getPlans.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.plans = action.payload;
        }
      )
      .addMatcher(planApi.endpoints.getPlans.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch plans";
      })

      .addMatcher(planApi.endpoints.getPlanById.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        planApi.endpoints.getPlanById.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.selectedPlan = action.payload;
        }
      )
      .addMatcher(
        planApi.endpoints.getPlanById.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Failed to fetch plan";
        }
      )

      .addMatcher(planApi.endpoints.createPlan.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        planApi.endpoints.createPlan.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.plans.push(action.payload);
          state.message = "Plan created successfully";
        }
      )
      .addMatcher(
        planApi.endpoints.createPlan.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Failed to create plan";
        }
      )

      .addMatcher(planApi.endpoints.updatePlan.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        planApi.endpoints.updatePlan.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          const index = state.plans.findIndex(
            (plan) =>
              plan.subscriptionPlanId === action.payload.subscriptionPlanId
          );
          if (index !== -1) {
            state.plans[index] = action.payload;
          }
          state.message = "Plan updated successfully";
        }
      )
      .addMatcher(
        planApi.endpoints.updatePlan.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Failed to update plan";
        }
      )

      .addMatcher(planApi.endpoints.deletePlan.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        planApi.endpoints.deletePlan.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.plans = state.plans.filter(
            (plan) => plan.subscriptionPlanId !== action.meta.arg.originalArgs
          );
          state.message = "Plan deleted successfully";
        }
      )
      .addMatcher(
        planApi.endpoints.deletePlan.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message || "Failed to delete plan";
        }
      );
  },
});

export const { resetPlanState, setSelectedPlan } = planSlice.actions;
export default planSlice.reducer;
