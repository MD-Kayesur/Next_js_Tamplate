// src/components/DeleteConfirmationDialog.tsx
"use client";
import { FiAlertTriangle } from "react-icons/fi";

interface DeleteConfirmationDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog = ({
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start">
          <div className="bg-red-100 p-2 rounded-full mr-4">
            <FiAlertTriangle className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Message
            </h3>
            <p className="text-gray-500">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
