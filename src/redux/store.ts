import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/features/auth/authSlice";
import userReducer from "@/redux/features/auth/userSlice";
import venueReducer from "@/redux/features/venue/venueSlice";
import contactReducer from "./features/auth/contactSlice";
import planReducer from "@/redux/features/auth/planSlice";
import quoteReducer from "@/redux/features/auth/quoteSlice";
import faqReducer from "@/redux/features/auth/faqSlice";
import termReducer from "@/redux/features/auth/termSlice";
import courseReducer from "@/redux/features/auth/courseSlice";
import moduleReducer from "@/redux/features/auth/moduleSlice";
import contentReducer from "@/redux/features/auth/contentSlice";
import videoReducer from "@/redux/features/auth/videoSlice";
import notificationReducer from "@/redux/features/auth/notificationSlice";
import paymentReducer from "@/redux/features/auth/paymentSlice";
import profileReducer from "@/redux/features/auth/profileSlice";
import updatesReducer from "@/redux/features/auth/updatesSlice";

import { baseApi } from "./hooks/baseApi";
import {
  PERSIST,
  REHYDRATE,
  PAUSE,
  FLUSH,
  PURGE,
  REGISTER,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
// PERSIST USER CONFIG
const persistConfig = {
  key: "user",
  storage,
};

const persiterReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persiterReducer,
    user: userReducer,
    venue: venueReducer,
    contact: contactReducer,
    plans: planReducer,
    quote: quoteReducer,
    faq: faqReducer,
    term: termReducer,
    course: courseReducer,
    module: moduleReducer,
    content: contentReducer,
    video: videoReducer,
    notification: notificationReducer,
    payment: paymentReducer,
    profile: profileReducer,
    updates: updatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [PERSIST, REHYDRATE, PAUSE, FLUSH, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// Persistor for the store
export const persistor = persistStore(store);

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
