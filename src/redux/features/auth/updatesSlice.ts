// src/redux/features/updates/updatesSlice.ts
import { UpcomingUpdate } from "@/redux/types/venue.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UpdatesState {
  isDialogOpen: boolean;
  selectedUpdate: UpcomingUpdate | null;
}

const initialState: UpdatesState = {
  isDialogOpen: false,
  selectedUpdate: null,
};

const updatesSlice = createSlice({
  name: "updates",
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<UpcomingUpdate | null>) => {
      state.isDialogOpen = true;
      state.selectedUpdate = action.payload;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
      state.selectedUpdate = null;
    },
  },
});

export const { openDialog, closeDialog } = updatesSlice.actions;
export default updatesSlice.reducer;
