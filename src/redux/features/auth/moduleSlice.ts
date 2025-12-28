import { IModule, IModuleState } from "@/redux/types/venue.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IModuleState = {
  modules: [],
  isLoading: false,
  error: null,
  currentModule: null,
  searchTerm: "",
  sortConfig: {
    field: "createdAt",
    direction: "desc",
  },
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    setModules: (state, action: PayloadAction<IModule[]>) => {
      state.modules = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentModule: (state, action: PayloadAction<IModule | null>) => {
      state.currentModule = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortConfig: (
      state,
      action: PayloadAction<{
        field: keyof IModule;
        direction: "asc" | "desc";
      }>
    ) => {
      state.sortConfig = action.payload;
    },
    resetModuleState: () => initialState,
  },
});

export const {
  setModules,
  setLoading,
  setError,
  setCurrentModule,
  setSearchTerm,
  setSortConfig,
  resetModuleState,
} = moduleSlice.actions;

export default moduleSlice.reducer;
