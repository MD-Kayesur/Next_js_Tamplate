// src/redux/features/course/courseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CourseState {
  searchTerm: string;
  filterPaid: "all" | "paid" | "free";
  currentPage: number;
}

const initialState: CourseState = {
  searchTerm: "",
  filterPaid: "all",
  currentPage: 1,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilterPaid: (state, action: PayloadAction<"all" | "paid" | "free">) => {
      state.filterPaid = action.payload;
    },
    resetFilters: (state) => {
      state.searchTerm = "";
      state.filterPaid = "all";
      state.currentPage = 1;
    },
  },
});

export const { setSearchTerm, setFilterPaid, resetFilters, setCurrentPage } =
  courseSlice.actions;
export default courseSlice.reducer;
