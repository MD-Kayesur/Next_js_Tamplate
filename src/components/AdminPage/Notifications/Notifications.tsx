"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import Title from "@/components/reuseabelComponents/Title";
import PageLoader from "../Shared/PageLoader";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { useNotifications } from "@/hooks/useNotifications";
import { markAllAsRead } from "@/redux/features/auth/notificationSlice";
import { useCreateNotificationMutation } from "@/redux/features/auth/notificationApi";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface NotificationFormData {
  title: string;
  message: string;
  userId: string;
}

const Notifications = () => {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((state) => state.notification);
  const { notifications, isLoading, isError, refetch, markAsRead } =
    useNotifications();
  const [createNotification] = useCreateNotificationMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>();

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      await Promise.all(unreadIds.map((id) => markAsRead(id)));
      dispatch(markAllAsRead());
      toast.success("All notifications marked as read");
    } catch (_) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const onSubmit = async (formData: NotificationFormData) => {
    try {
      await createNotification(formData).unwrap();
      toast.success("Notification created successfully");
      reset();
      refetch();
    } catch (_) {
      toast.error("Failed to create notification");
    }
  };

  if (isLoading) return <PageLoader />;
  if (isError) return <div>Error loading notifications</div>;

  return (
    <div className="space-y-6 border-b">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Title title="Notifications" />
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Mark all as read
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Add Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter notification title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...register("message", {
                      required: "Message is required",
                    })}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    {...register("userId", { required: "User ID is required" })}
                    placeholder="Enter user ID"
                  />
                  {errors.userId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.userId.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Create Notification
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white border-b rounded-lg shadow-sm overflow-x-auto">
        <Table>
          <TableCaption>
            {notifications.length === 0
              ? "No notifications available"
              : `Showing ${notifications.length} notification(s)`}
          </TableCaption>
          <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
            <TableRow>
              <TableHead className="px-4 py-3">Title</TableHead>
              <TableHead className="px-4 py-3">Message</TableHead>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell className="font-medium">
                  {notification.title}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {notification.message}
                </TableCell>
                <TableCell>
                  {format(new Date(notification.createdAt), "PPpp")}
                </TableCell>
                <TableCell>
                  {notification.isRead ? (
                    <Badge variant="outline">Read</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800">Unread</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Notifications;

// "use client";

// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { toast } from "sonner";
// import { useForm } from "react-hook-form";
// import { format } from "date-fns";

// import Title from "@/components/reuseabelComponents/Title";
// import PageLoader from "../Shared/PageLoader";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { useNotifications } from "@/hooks/useNotifications";
// import { markAllAsRead } from "@/redux/features/auth/notificationSlice";
// import { useCreateNotificationMutation } from "@/redux/features/auth/notificationApi";

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";

// interface NotificationFormData {
//   title: string;
//   message: string;
//   userId: string;
// }

// const Notifications = () => {
//   const dispatch = useAppDispatch();
//   const { unreadCount } = useAppSelector((state) => state.notification);
//   const { notifications, isLoading, isError, refetch, markAsRead } =
//     useNotifications();
//   const [createNotification] = useCreateNotificationMutation();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<NotificationFormData>();

//   const handleMarkAllAsRead = async () => {
//     try {
//       const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
//       await Promise.all(unreadIds.map((id) => markAsRead(id)));
//       dispatch(markAllAsRead());
//       toast.success("All notifications marked as read");
//     } catch (_) {
//       toast.error("Failed to mark all notifications as read");
//     }
//   };

//   const onSubmit = async (formData: NotificationFormData) => {
//     try {
//       await createNotification(formData).unwrap();
//       toast.success("Notification created successfully");
//       reset();
//       refetch();
//     } catch (_) {
//       toast.error("Failed to create notification");
//     }
//   };

//   if (isLoading) return <PageLoader />;
//   if (isError) return <div>Error loading notifications</div>;

//   return (
//     <div className="space-y-6 border-b">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <Title title="Notifications" />
//         <div className="flex items-center gap-4">
//           {unreadCount > 0 && (
//             <Button
//               variant="outline"
//               onClick={handleMarkAllAsRead}
//               className="bg-blue-50 text-blue-600 hover:bg-blue-100"
//             >
//               Mark all as read
//             </Button>
//           )}
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Notification
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create New Notification</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     {...register("title", { required: "Title is required" })}
//                     placeholder="Enter notification title"
//                   />
//                   {errors.title && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.title.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="message">Message</Label>
//                   <Textarea
//                     id="message"
//                     {...register("message", {
//                       required: "Message is required",
//                     })}
//                     placeholder="Enter notification message"
//                     rows={4}
//                   />
//                   {errors.message && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.message.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="userId">User ID</Label>
//                   <Input
//                     id="userId"
//                     {...register("userId", { required: "User ID is required" })}
//                     placeholder="Enter user ID"
//                   />
//                   {errors.userId && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.userId.message}
//                     </p>
//                   )}
//                 </div>
//                 <Button type="submit" className="w-full">
//                   Create Notification
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <Card className="bg-white border-b rounded-lg shadow-sm overflow-x-auto">
//         <Table>
//           <TableCaption>
//             {notifications.length === 0
//               ? "No notifications available"
//               : `Showing ${notifications.length} notification(s)`}
//           </TableCaption>
//           <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
//             <TableRow>
//               <TableHead className="px-4 py-3">Title</TableHead>
//               <TableHead className="px-4 py-3">Message</TableHead>
//               <TableHead className="px-4 py-3">Date</TableHead>
//               <TableHead className="px-4 py-3">Status</TableHead>
//               <TableHead className="px-4 py-3">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {notifications.map((notification) => (
//               <TableRow key={notification.id}>
//                 <TableCell className="font-medium">
//                   {notification.title}
//                 </TableCell>
//                 <TableCell className="max-w-xs truncate">
//                   {notification.message}
//                 </TableCell>
//                 <TableCell>
//                   {format(new Date(notification.createdAt), "PPpp")}
//                 </TableCell>
//                 <TableCell>
//                   {notification.isRead ? (
//                     <Badge variant="outline">Read</Badge>
//                   ) : (
//                     <Badge className="bg-blue-100 text-blue-800">Unread</Badge>
//                   )}
//                 </TableCell>
//                 <TableCell>
//                   {!notification.isRead && (
//                     <Button
//                       variant="ghost"
//                       onClick={() => markAsRead(notification.id)}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       Mark as read
//                     </Button>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>
//     </div>
//   );
// };

// export default Notifications;

// "use client";

// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { toast } from "sonner";
// import { useForm } from "react-hook-form";
// import { format } from "date-fns";

// import Title from "@/components/reuseabelComponents/Title";
// import PageLoader from "../Shared/PageLoader";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import { useNotifications } from "@/hooks/useNotifications";
// import { markAllAsRead } from "@/redux/features/auth/notificationSlice";
// import { useCreateNotificationMutation } from "@/redux/features/auth/notificationApi";

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";

// interface NotificationFormData {
//   title: string;
//   message: string;
//   userId: string;
// }

// const Notifications = () => {
//   const dispatch = useAppDispatch();
//   const { unreadCount } = useAppSelector((state) => state.notification);
//   const { notifications, isLoading, isError, refetch, markAsRead } =
//     useNotifications();
//   const [createNotification] = useCreateNotificationMutation();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<NotificationFormData>();

//   const handleMarkAllAsRead = async () => {
//     try {
//       const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

//       await Promise.all(unreadIds.map((id) => markAsRead(id)));
//       dispatch(markAllAsRead());
//       toast.success("All notifications marked as read");
//     } catch (error) {
//       toast.error("Failed to mark all notifications as read");
//     }
//   };

//   const onSubmit = async (formData: NotificationFormData) => {
//     try {
//       await createNotification(formData).unwrap();
//       toast.success("Notification created successfully");
//       reset();
//       refetch();
//     } catch (error) {
//       toast.error("Failed to create notification");
//     }
//   };

//   if (isLoading) return <PageLoader />;
//   if (isError) return <div>Error loading notifications</div>;

//   return (
//     <div className="space-y-6 border-b">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <Title title="Notifications" />
//         <div className="flex items-center gap-4">
//           {unreadCount > 0 && (
//             <Button
//               variant="outline"
//               onClick={handleMarkAllAsRead}
//               className="bg-blue-50 text-blue-600 hover:bg-blue-100"
//             >
//               Mark all as read
//             </Button>
//           )}
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Notification
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create New Notification</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title </Label>
//                   <Input
//                     id="title"
//                     {...register("title", { required: "Title is required" })}
//                     placeholder="Enter notification title"
//                   />
//                   {errors.title && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.title.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="message">Message </Label>
//                   <Textarea
//                     id="message"
//                     {...register("message", {
//                       required: "Message is required",
//                     })}
//                     placeholder="Enter notification message"
//                     rows={4}
//                   />
//                   {errors.message && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.message.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="userId">User ID </Label>
//                   <Input
//                     id="userId"
//                     {...register("userId", { required: "User ID is required" })}
//                     placeholder="Enter user ID"
//                   />
//                   {errors.userId && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.userId.message}
//                     </p>
//                   )}
//                 </div>
//                 <Button type="submit" className="w-full">
//                   Create Notification
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <Card className="bg-white border-b rounded-lg shadow-sm overflow-x-auto">
//         <Table>
//           <TableCaption>
//             {notifications.length === 0
//               ? "No notifications available"
//               : `Showing ${notifications.length} notification(s)`}
//           </TableCaption>
//           <TableHeader className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
//             <TableRow>
//               <TableHead className="px-4 py-3">Title</TableHead>
//               <TableHead className="px-4 py-3">Message</TableHead>
//               <TableHead className="px-4 py-3">Date</TableHead>
//               <TableHead className="px-4 py-3">Status</TableHead>
//               <TableHead className="px-4 py-3">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {notifications.map((notification) => (
//               <TableRow key={notification.id}>
//                 <TableCell className="font-medium">
//                   {notification.title}
//                 </TableCell>
//                 <TableCell className="max-w-xs truncate">
//                   {notification.message}
//                 </TableCell>
//                 <TableCell>
//                   {format(new Date(notification.createdAt), "PPpp")}
//                 </TableCell>
//                 <TableCell>
//                   {notification.isRead ? (
//                     <Badge variant="outline">Read</Badge>
//                   ) : (
//                     <Badge className="bg-blue-100 text-blue-800">Unread</Badge>
//                   )}
//                 </TableCell>
//                 <TableCell>
//                   {!notification.isRead && (
//                     <Button
//                       variant="ghost"
//                       onClick={() => markAsRead(notification.id)}
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       Mark as read
//                     </Button>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>
//     </div>
//   );
// };

// export default Notifications;
