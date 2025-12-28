// src/redux/features/auth/paymentSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface PaymentState {
  selectedPayment: string | null;
  filterStatus: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED" | "ALL";
}

const initialState: PaymentState = {
  selectedPayment: null,
  filterStatus: "ALL",
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { setSelectedPayment, setFilterStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
