"use client";

import { FiUser, FiMail, FiClock, FiMessageSquare } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Message } from "@/redux/types/venue.type";

interface MessageDetailViewProps {
  message: Message;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const MessageDetailView = ({ message, onClose }: MessageDetailViewProps) => {
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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Message Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 cursor-pointer"
          >
            <RxCross2 className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Sender Info */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {message.name}
              </h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <FiMail className="mr-2" />
                <span>{message.email}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <FiClock className="mr-2" />
                <span>{formatDate(message.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center text-gray-600 mb-2 font-medium">
              <FiMessageSquare className="mr-2" />
              Message
            </div>
            <p className="text-gray-800 whitespace-pre-line">
              {message.opinion}
            </p>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default MessageDetailView;
