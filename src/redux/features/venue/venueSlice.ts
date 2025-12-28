// src/redux/features/venue/venueSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Venue } from "@/redux/types/venue.type";

interface VenueState {
  currentVenue: Venue | null;
  filterStatus: string | null;
}

const initialState: VenueState = {
  currentVenue: null,
  filterStatus: "ACTIVE", // Changed to uppercase to match API
};

const venueSlice = createSlice({
  name: "venue",
  initialState,
  reducers: {
    setCurrentVenue: (state, action: PayloadAction<Venue | null>) => {
      state.currentVenue = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { setCurrentVenue, setFilterStatus } = venueSlice.actions;
export default venueSlice.reducer;
