// src/redux/slices/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  searchTerm: string;
  roleFilter: string | null;
}

const initialState: UserState = {
  searchTerm: "",
  roleFilter: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
  },
});

export const { setSearchTerm, setRoleFilter } = userSlice.actions;
export default userSlice.reducer;
