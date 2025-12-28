import { createSlice } from "@reduxjs/toolkit";

interface VideoState {
  uploadProgress: number;
  isUploading: boolean;
  searchQuery: string;
}

const initialState: VideoState = {
  uploadProgress: 0,
  isUploading: false,
  searchQuery: "",
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setUploadProgress, setIsUploading, setSearchQuery } =
  videoSlice.actions;
export default videoSlice.reducer;
