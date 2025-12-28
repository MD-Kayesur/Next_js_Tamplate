// src/redux/features/auth/contentSlice.ts
import { Content } from "@/redux/types/venue.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ContentState {
  contents: Content[];
  currentContent: Content | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  isUpdateDialogOpen: boolean;
}

const initialState: ContentState = {
  contents: [],
  currentContent: null,
  isLoading: false,
  error: null,
  searchTerm: "",
  isUpdateDialogOpen: false,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setContents: (state, action: PayloadAction<Content[]>) => {
      state.contents = action.payload;
    },
    setCurrentContent: (state, action: PayloadAction<Content>) => {
      state.currentContent = action.payload;
    },
    updateContent: (state, action: PayloadAction<Content>) => {
      const index = state.contents.findIndex(
        (content) => content.id === action.payload.id
      );
      if (index !== -1) {
        state.contents[index] = action.payload;
      }
      if (state.currentContent?.id === action.payload.id) {
        state.currentContent = action.payload;
      }
    },
    removeContent: (state, action: PayloadAction<string>) => {
      state.contents = state.contents.filter(
        (content) => content.id !== action.payload
      );
      if (state.currentContent?.id === action.payload) {
        state.currentContent = null;
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    openUpdateDialog: (state) => {
      state.isUpdateDialogOpen = true;
    },
    closeUpdateDialog: (state) => {
      state.isUpdateDialogOpen = false;
    },
    resetContentState: () => initialState,
  },
});

export const {
  setContents,
  setCurrentContent,
  updateContent,
  removeContent,
  setSearchTerm,
  openUpdateDialog,
  closeUpdateDialog,
  resetContentState,
} = contentSlice.actions;

export default contentSlice.reducer;
