/* import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Venue {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface VenueState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}

const initialState: VenueState = {
  venues: [],
  loading: false,
  error: null,
};

export const fetchVenues = createAsyncThunk("venue/fetchVenues", async () => {
  const response = await axios.get<Venue[]>("/api/venues");
  return response.data;
});

const venueSlice = createSlice({
  name: "venue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch venues.";
      });
  },
});

export default venueSlice.reducer;
export type { Venue };
export { fetchVenues };
 */
