import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TermCategory, KeyPoint } from "@/redux/types/venue.type";

interface TermState {
  selectedCategory: string | null;
  expandedCategories: string[];
  editMode: boolean;
  currentCategory: Partial<TermCategory> | null;
  currentKeyPoint: Partial<KeyPoint> | null;
}

const initialState: TermState = {
  selectedCategory: null,
  expandedCategories: [],
  editMode: false,
  currentCategory: null,
  currentKeyPoint: null,
};

const termSlice = createSlice({
  name: "terms",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    toggleExpandCategory: (state, action: PayloadAction<string>) => {
      const index = state.expandedCategories.indexOf(action.payload);
      if (index >= 0) {
        state.expandedCategories.splice(index, 1);
      } else {
        state.expandedCategories.push(action.payload);
      }
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
    setCurrentCategory: (
      state,
      action: PayloadAction<Partial<TermCategory> | null>
    ) => {
      state.currentCategory = action.payload;
    },
    setCurrentKeyPoint: (
      state,
      action: PayloadAction<Partial<KeyPoint> | null>
    ) => {
      state.currentKeyPoint = action.payload;
    },
    resetTermState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSelectedCategory,
  toggleExpandCategory,
  setEditMode,
  setCurrentCategory,
  setCurrentKeyPoint,
  resetTermState,
} = termSlice.actions;

export default termSlice.reducer;
