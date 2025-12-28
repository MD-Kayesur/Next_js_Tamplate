// src/redux/features/search/searchSlice.ts

import { meiliClient } from "@/lib/meilisearch";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the product data returned by MeiliSearch
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  // Add other fields as per your index structure
}

interface SearchState {
  results: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SearchState = {
  results: [],
  status: "idle",
  error: null,
};

// Async thunk for fetching global search results
export const fetchGlobalSearch = createAsyncThunk<Product[], string>(
  "search/fetchGlobalSearch",
  async (query: string) => {
    const index = meiliClient.index<Product>("products"); // specify type here too
    const res = await index.search(query);
    return res.hits;
  }
);

// Create the search slice
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalSearch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchGlobalSearch.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.status = "succeeded";
          state.results = action.payload;
        }
      )
      .addCase(fetchGlobalSearch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export default searchSlice.reducer;
