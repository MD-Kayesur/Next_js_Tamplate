"use client";

import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@/redux/features/auth/notificationApi";
import { useEffect, useRef } from "react";
import {
  setNotifications,
  markAsRead,
} from "@/redux/features/auth/notificationSlice";
import { useAppDispatch } from "@/redux/hooks/redux-hook";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const {
    data: apiNotifications = [],
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsQuery();

  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const previousNotifications = useRef(apiNotifications);

  useEffect(() => {
    // Only dispatch if notifications actually changed
    if (
      JSON.stringify(previousNotifications.current) !==
      JSON.stringify(apiNotifications)
    ) {
      dispatch(setNotifications(apiNotifications));
      previousNotifications.current = apiNotifications;
    }
  }, [apiNotifications, dispatch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id).unwrap();
      dispatch(markAsRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  };

  return {
    notifications: apiNotifications, // Use directly from API
    isLoading,
    isError,
    refetch,
    markAsRead: handleMarkAsRead,
  };
};
