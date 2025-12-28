// src/components/ContractMessages/ContractMessages.tsx
"use client";

import { useState } from "react";
import { FiMail, FiUser, FiClock, FiSearch, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { setSearchTerm } from "@/redux/features/auth/contactSlice";
import {
  useGetContactMessagesQuery,
  useDeleteContactMessageMutation,
} from "@/redux/features/auth/contactApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import PageLoader from "../Shared/PageLoader";
import { Button } from "@/components/ui/button";

import { Message } from "@/redux/types/venue.type";
import MessageDetailView from "./MessageDetailView";
import Title from "@/components/reuseabelComponents/Title";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ContractMessages = () => {
  const dispatch = useAppDispatch();
  const { searchTerm } = useAppSelector((state) => state.contact);
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useGetContactMessagesQuery();
  const [deleteMessage] = useDeleteContactMessageMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDeleteDialog = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMessage(messageToDelete).unwrap();
      toast.success("Message deleted successfully");
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
      }
      if (filteredMessages.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const openMessageDetail = (message: Message) => {
    setSelectedMessage(message);
  };

  const closeMessageDetail = () => {
    setSelectedMessage(null);
  };

  const filteredMessages = messages.filter((message) => {
    return (
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.opinion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const totalMessages = filteredMessages.length;
  const totalPages = Math.ceil(totalMessages / pageSize);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div>
        <PageLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">
          {"message" in error ? error.message : "An error occurred"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Message Detail View */}
      {selectedMessage && (
        <MessageDetailView
          message={selectedMessage}
          onClose={closeMessageDetail}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                  Deleting...
                </>
              ) : (
                "Delete Message"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Title title="Contract Messages" />
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <FiMail className="text-gray-500" />
            <span className="font-medium text-gray-700">
              {totalMessages} Message{totalMessages !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              />
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiMail className="text-gray-400 w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No messages found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No messages match your search criteria."
                  : "You have no messages yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {message.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {message.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pl-14">
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {message.opinion}
                      </p>
                      <div className="pt-4 border-t border-gray-200 flex space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMessageDetail(message)}
                          className="cursor-pointer"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Delete"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          onClick={() => openDeleteDialog(message.id)}
                        >
                          <FiTrash2 className="h-4 w-4 text-destructive" />{" "}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalMessages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalMessages)}
                    </span>{" "}
                    of <span className="font-medium">{totalMessages}</span>{" "}
                    messages
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor: currentPage === 1 ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                      style={{
                        backgroundColor:
                          currentPage === totalPages ? "white" : "white",
                        color: "#2D0954",
                        borderColor: "#2D0954",
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractMessages;

// // src/components/ContractMessages/ContractMessages.tsx
// "use client";

// import { useState } from "react";
// import {
//   FiMail,
//   FiUser,
//   FiClock,
//   FiSearch,
//   FiTrash2,
//   FiArrowRight,
//   FiX,
// } from "react-icons/fi";
// import { toast } from "sonner";

// import { setSearchTerm, setFilter } from "@/redux/features/auth/contactSlice";
// import {
//   useGetContactMessagesQuery,
//   useUpdateMessageReadStatusMutation,
//   useDeleteContactMessageMutation,
// } from "@/redux/features/auth/contactApi";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
// import PageLoader from "../Shared/PageLoader";
// import { Button } from "@/components/ui/button";

// import { Message } from "@/redux/types/venue.type";
// import MessageDetailView from "./MessageDetailView";
// import Title from "@/components/reuseabelComponents/Title";

// const ContractMessages = () => {
//   const dispatch = useAppDispatch();
//   const { searchTerm, filter } = useAppSelector((state) => state.contact);
//   const {
//     data: messages = [],
//     isLoading,
//     isError,
//     error,
//   } = useGetContactMessagesQuery();
//   const [updateReadStatus] = useUpdateMessageReadStatusMutation();
//   const [deleteMessage] = useDeleteContactMessageMutation();
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
//   const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleToggleRead = async (id: string, currentStatus: boolean) => {
//     try {
//       await updateReadStatus({ id, read: !currentStatus }).unwrap();
//       toast.success("Read status updated successfully");
//     } catch (err) {
//       console.error("Failed to update read status:", err);
//       toast.error("Failed to update read status");
//     }
//   };

//   const openDeleteDialog = (id: string) => {
//     setMessageToDelete(id);
//     setDeleteDialogOpen(true);
//   };

//   const closeDeleteDialog = () => {
//     setDeleteDialogOpen(false);
//     setMessageToDelete(null);
//   };

//   const handleDelete = async () => {
//     if (!messageToDelete) return;

//     try {
//       await deleteMessage(messageToDelete).unwrap();
//       toast.success("Message deleted successfully");
//       closeDeleteDialog();
//       if (selectedMessage?.id === messageToDelete) {
//         setSelectedMessage(null);
//       }
//     } catch (err) {
//       console.error("Failed to delete message:", err);
//       toast.error("Failed to delete message");
//     }
//   };

//   const openMessageDetail = (message: Message) => {
//     setSelectedMessage(message);
//     if (!message.read) {
//       handleToggleRead(message.id, false);
//     }
//   };

//   const closeMessageDetail = () => {
//     setSelectedMessage(null);
//   };

//   const filteredMessages = messages.filter((message) => {
//     const matchesSearch =
//       message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       message.opinion.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesFilter =
//       filter === "all" ||
//       (filter === "read" && message.read) ||
//       (filter === "unread" && !message.read);

//     return matchesSearch && matchesFilter;
//   });

//   const unreadCount = messages.filter((message) => !message.read).length;

//   if (isLoading) {
//     return (
//       <div>
//         <PageLoader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-red-500 text-lg">
//           {"message" in error ? error.message : "An error occurred"}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       {/* Message Detail View */}
//       {selectedMessage && (
//         <MessageDetailView
//           message={selectedMessage}
//           onClose={closeMessageDetail}
//           onToggleRead={handleToggleRead}
//           onDelete={openDeleteDialog}
//         />
//       )}

//       {/* Delete Confirmation Dialog */}
//       {deleteDialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <div className="flex justify-between items-start mb-4">
//               <h3 className="text-lg font-medium text-gray-900">
//                 Delete Message
//               </h3>
//               <button
//                 onClick={closeDeleteDialog}
//                 className="text-gray-400 hover:text-gray-500 cursor-pointer"
//               >
//                 <FiX className="h-6 w-6" />
//               </button>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600">
//                 Are you sure you want to delete this message? This action cannot
//                 be undone.
//               </p>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={closeDeleteDialog}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mx-auto space-y-4">
//         <div className="flex justify-between items-center">
//           <div>
//             <Title title="Contract Messages" />
//           </div>
//           <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
//             <FiMail className="text-gray-500" />
//             <span className="font-medium text-gray-700">
//               {unreadCount} Message{unreadCount !== 1 ? "s" : ""}
//             </span>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
//           <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="relative flex-1 max-w-md">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FiSearch className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Search messages..."
//                 value={searchTerm}
//                 onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//               />
//             </div>
//           </div>

//           {filteredMessages.length === 0 ? (
//             <div className="p-12 text-center">
//               <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                 <FiMail className="text-gray-400 w-10 h-10" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-1">
//                 No messages found
//               </h3>
//               <p className="text-gray-500 max-w-md mx-auto">
//                 {searchTerm
//                   ? "No messages match your search criteria."
//                   : filter === "read"
//                   ? "You have no read messages."
//                   : filter === "unread"
//                   ? "You have no unread messages."
//                   : "You have no messages yet."}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredMessages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`p-6 hover:bg-gray-50 transition-colors duration-150 ${
//                     !message.read ? "bg-blue-50" : ""
//                   }`}
//                 >
//                   <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
//                     <div className="flex items-start space-x-4">
//                       <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
//                         <FiUser className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-gray-900 flex items-center space-x-2">
//                           <span>{message.name}</span>
//                           {!message.read && (
//                             <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
//                               New
//                             </span>
//                           )}
//                         </h3>
//                         <p className="text-sm text-gray-500">{message.email}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-3 text-sm text-gray-500">
//                       <div className="flex items-center space-x-1">
//                         <FiClock className="w-4 h-4" />
//                         <span>{formatDate(message.createdAt)}</span>
//                       </div>
//                       <button
//                         onClick={() =>
//                           handleToggleRead(message.id, !!message.read)
//                         }
//                         className={`px-3 py-1 rounded-md text-xs font-medium ${
//                           message.read
//                             ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                             : "bg-blue-100 text-blue-600 hover:bg-blue-200"
//                         }`}
//                       >
//                         {message.read ? "Mark Unread" : "Mark Read"}
//                       </button>
//                     </div>
//                   </div>
//                   <div className="pl-14">
//                     <p className="text-gray-700 line-clamp-2 mb-4">
//                       {message.opinion}
//                     </p>
//                     <div className="pt-4 border-t border-gray-200 flex space-x-4">
//                       <button
//                         onClick={() => openMessageDetail(message)}
//                         className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
//                       >
//                         View Details <FiArrowRight className="ml-1" />
//                       </button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         title="Delete"
//                         className="text-red-500 hover:bg-red-100 hover:text-red-500 cursor-pointer"
//                         onClick={() => openDeleteDialog(message.id)}
//                       >
//                         <FiTrash2 className="h-4 w-4 text-destructive" /> Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContractMessages;
