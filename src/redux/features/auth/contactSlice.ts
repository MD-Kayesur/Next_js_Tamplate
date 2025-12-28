// src/redux/features/auth/contactSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ContactState {
  searchTerm: string;
  filter: "all" | "read" | "unread";
}

const initialState: ContactState = {
  searchTerm: "",
  filter: "all",
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilter: (state, action: PayloadAction<"all" | "read" | "unread">) => {
      state.filter = action.payload;
    },
    resetContactState: () => initialState,
  },
});

export const { setSearchTerm, setFilter, resetContactState } =
  contactSlice.actions;

export default contactSlice.reducer;
