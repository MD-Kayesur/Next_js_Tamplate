// src/redux/slices/quoteSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quote } from "@/type/quotes";

interface QuoteState {
  editingQuote: Quote | null;
  isDialogOpen: boolean;
  isSubmitting: boolean;
}

const initialState: QuoteState = {
  editingQuote: null,
  isDialogOpen: false,
  isSubmitting: false,
};

export const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {
    openDialog: (state) => {
      state.isDialogOpen = true;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
      state.editingQuote = null;
    },
    startEditing: (state, action: PayloadAction<Quote>) => {
      state.editingQuote = action.payload;
      state.isDialogOpen = true;
    },
    startSubmitting: (state) => {
      state.isSubmitting = true;
    },
    stopSubmitting: (state) => {
      state.isSubmitting = false;
    },
    resetForm: (state) => {
      state.editingQuote = null;
    },
  },
});

export const {
  openDialog,
  closeDialog,
  startEditing,
  startSubmitting,
  stopSubmitting,
  resetForm,
} = quoteSlice.actions;

export default quoteSlice.reducer;
