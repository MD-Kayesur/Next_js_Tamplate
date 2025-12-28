// src/redux/slices/profileSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  isEditing: boolean;
  tempAvatar: string | null;
}

const initialState: ProfileState = {
  isEditing: false,
  tempAvatar: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    setTempAvatar: (state, action: PayloadAction<string | null>) => {
      state.tempAvatar = action.payload;
    },
  },
});

export const { setEditing, setTempAvatar } = profileSlice.actions;
export default profileSlice.reducer;
