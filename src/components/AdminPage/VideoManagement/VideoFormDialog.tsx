// src/components/VideoFormDialog.tsx
"use client";
import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { toast } from "sonner";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface VideoFormDialogProps {
  mode: "create" | "update";
  video?: any;
  onClose: () => void;
  onSuccess: () => void;
  isUploading: boolean;
  uploadProgress: number;
  onSubmit: (formData: FormData) => Promise<void>;
}

const VideoFormDialog = ({
  mode,
  video,
  onClose,
  onSuccess,
  isUploading,
  uploadProgress,
  onSubmit,
}: VideoFormDialogProps) => {
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    tags: video?.tags?.join(",") || "",
    isFeatured: video?.isFeatured || false,
    duration: video?.duration || 0,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // src/components/VideoFormDialog.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("tags", formData.tags);
    data.append("isFeatured", String(formData.isFeatured));

    // For updates, only append files if they exist
    if (mode === "update") {
      if (videoFile) data.append("video", videoFile);
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);
      // Convert duration to number
      data.append("duration", String(Number(formData.duration)));
    } else {
      // For create, files are required
      if (!videoFile || !thumbnailFile) {
        toast.error("Please select both video and thumbnail files");
        return;
      }
      data.append("video", videoFile);
      data.append("thumbnail", thumbnailFile);
    }

    try {
      await onSubmit(data);
      onSuccess();
    } catch (error: any) {
      console.error("Form submission failed:", error);
      toast.error(error.data?.message || "Failed to submit form");
    }
  };

  return (
    <Card className="w-full max-w-2xl border-none shadow-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="tags">Tags (comma separated) *</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              required
            />
          </div>

          {mode === "update" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                disabled
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: Boolean(checked),
                }))
              }
            />
            <Label htmlFor="isFeatured">Featured Video</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Video File{" "}
              {mode === "update" ? "(Leave empty to keep current)" : "*"}
            </Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-4">
                  <FiUpload className="w-6 h-6 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required={mode === "create"}
                />
              </Label>
            </div>
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {videoFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Thumbnail Image{" "}
              {mode === "update" ? "(Leave empty to keep current)" : "*"}
            </Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-6 h-6 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <Input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="hidden"
                  required={mode === "create"}
                />
              </Label>
            </div>
            {thumbnailFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {mode === "create" ? "Uploading..." : "Updating..."}
            </p>
            <Progress value={uploadProgress} />
            <p className="text-xs text-right text-muted-foreground">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            className="border border-[var(--color-blueOne)] text-[var(--color-blueOne)] font-medium px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-blueOne)/10] cursor-pointer"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
            type="submit"
            disabled={isUploading}
          >
            {isUploading
              ? mode === "create"
                ? "Uploading..."
                : "Updating..."
              : mode === "create"
              ? "Upload Video"
              : "Update Video"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default VideoFormDialog;

// // src/components/VideoFormDialog.tsx
// "use client";
// import React, { useState, useEffect } from "react";
// import { FiUpload } from "react-icons/fi";
// import { toast } from "sonner";

// // shadcn/ui components
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";

// interface VideoFormDialogProps {
//   mode: "create" | "update";
//   video?: any;
//   onClose: () => void;
//   onSuccess: () => void;
//   isUploading: boolean;
//   uploadProgress: number;
//   onSubmit: (formData: FormData) => Promise<void>;
// }

// const VideoFormDialog = ({
//   mode,
//   video,
//   onClose,
//   onSuccess,
//   isUploading,
//   uploadProgress,
//   onSubmit,
// }: VideoFormDialogProps) => {
//   const [formData, setFormData] = useState({
//     title: video?.title || "",
//     description: video?.description || "",
//     tags: video?.tags?.join(",") || "",
//     isFeatured: video?.isFeatured || false,
//     duration: video?.duration || 0,
//   });
//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value, type } = e.target;
//     const checked =
//       type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (mode === "create" && (!videoFile || !thumbnailFile)) {
//       toast.error("Please select both video and thumbnail files");
//       return;
//     }

//     const data = new FormData();
//     data.append("title", formData.title);
//     data.append("description", formData.description);
//     data.append("tags", formData.tags);
//     data.append("isFeatured", String(formData.isFeatured));
//     data.append("duration", String(formData.duration));

//     if (videoFile) data.append("video", videoFile);
//     if (thumbnailFile) data.append("thumbnail", thumbnailFile);

//     try {
//       await onSubmit(data);
//       onSuccess();
//     } catch (error) {
//       console.error("Form submission failed:", error);
//     }
//   };

//   return (
//     <Card className="w-full max-w-2xl border-none shadow-none">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <div className="sm:col-span-2 space-y-2">
//             <Label htmlFor="title">Title *</Label>
//             <Input
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="sm:col-span-2 space-y-2">
//             <Label htmlFor="description">Description *</Label>
//             <Textarea
//               id="description"
//               name="description"
//               rows={3}
//               value={formData.description}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="sm:col-span-2 space-y-2">
//             <Label htmlFor="tags">Tags (comma separated) *</Label>
//             <Input
//               id="tags"
//               name="tags"
//               value={formData.tags}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="duration">Duration (seconds) *</Label>
//             <Input
//               id="duration"
//               name="duration"
//               type="number"
//               value={formData.duration}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="isFeatured"
//               name="isFeatured"
//               checked={formData.isFeatured}
//               onCheckedChange={(checked) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   isFeatured: Boolean(checked),
//                 }))
//               }
//             />
//             <Label htmlFor="isFeatured">Featured Video</Label>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label>
//               Video File{" "}
//               {mode === "update" ? "(Leave empty to keep current)" : "*"}
//             </Label>
//             <div className="flex items-center justify-center w-full">
//               <Label
//                 htmlFor="video-upload"
//                 className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
//               >
//                 <div className="flex flex-col items-center justify-center pt-5 pb-4">
//                   <FiUpload className="w-6 h-6 mb-3 text-muted-foreground" />
//                   <p className="mb-2 text-sm text-muted-foreground">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag and drop
//                   </p>
//                 </div>
//                 <Input
//                   id="video-upload"
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
//                   className="hidden"
//                   required={mode === "create"}
//                 />
//               </Label>
//             </div>
//             {videoFile && (
//               <p className="text-sm text-muted-foreground">
//                 Selected: {videoFile.name}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label>
//               Thumbnail Image{" "}
//               {mode === "update" ? "(Leave empty to keep current)" : "*"}
//             </Label>
//             <div className="flex items-center justify-center w-full">
//               <Label
//                 htmlFor="thumbnail-upload"
//                 className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
//               >
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <FiUpload className="w-6 h-6 mb-3 text-muted-foreground" />
//                   <p className="mb-2 text-sm text-muted-foreground">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag and drop
//                   </p>
//                 </div>
//                 <Input
//                   id="thumbnail-upload"
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setThumbnailFile(e.target.files?.[0] || null)
//                   }
//                   className="hidden"
//                   required={mode === "create"}
//                 />
//               </Label>
//             </div>
//             {thumbnailFile && (
//               <p className="text-sm text-muted-foreground">
//                 Selected: {thumbnailFile.name}
//               </p>
//             )}
//           </div>
//         </div>

//         {isUploading && (
//           <div className="space-y-2">
//             <p className="text-sm text-muted-foreground">
//               {mode === "create" ? "Uploading..." : "Updating..."}
//             </p>
//             <Progress value={uploadProgress} />
//             <p className="text-xs text-right text-muted-foreground">
//               {uploadProgress}% complete
//             </p>
//           </div>
//         )}

//         <div className="flex justify-end space-x-3">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onClose}
//             disabled={isUploading}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isUploading}>
//             {isUploading
//               ? mode === "create"
//                 ? "Uploading..."
//                 : "Updating..."
//               : mode === "create"
//               ? "Upload Video"
//               : "Update Video"}
//           </Button>
//         </div>
//       </form>
//     </Card>
//   );
// };

// export default VideoFormDialog;
