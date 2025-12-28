// src/redux/features/auth/faqSlice.ts
import { FAQ } from "@/redux/types/venue.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FaqState {
  currentFaq: FAQ | null;
  isDialogOpen: {
    faq: boolean;
    category: boolean;
  };
}

const initialState: FaqState = {
  currentFaq: null,
  isDialogOpen: {
    faq: false,
    category: false,
  },
};

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    setCurrentFaq: (state, action: PayloadAction<FAQ | null>) => {
      state.currentFaq = action.payload;
    },
    openFaqDialog: (state, action: PayloadAction<boolean>) => {
      state.isDialogOpen.faq = action.payload;
    },
    openCategoryDialog: (state, action: PayloadAction<boolean>) => {
      state.isDialogOpen.category = action.payload;
    },
    resetFaqState: (state) => {
      state.currentFaq = null;
      state.isDialogOpen = {
        faq: false,
        category: false,
      };
    },
  },
});

export const {
  setCurrentFaq,
  openFaqDialog,
  openCategoryDialog,
  resetFaqState,
} = faqSlice.actions;

export default faqSlice.reducer;
