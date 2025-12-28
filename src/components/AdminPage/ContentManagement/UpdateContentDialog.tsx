// src/components/AdminPage/ContentManagement/UpdateContentDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateContentMutation,
  useGetContentByIdQuery,
} from "@/redux/features/auth/contentApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { closeUpdateDialog } from "@/redux/features/auth/contentSlice";
import { Content } from "@/redux/types/venue.type";

export const UpdateContentDialog = () => {
  const dispatch = useAppDispatch();
  const { currentContent, isUpdateDialogOpen } = useAppSelector(
    (state) => state.content
  );

  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    duration: 0,
    description: "",
    tags: [] as string[],
    viewCount: 0,
  });

  const [currentTag, setCurrentTag] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: existingContent, isLoading: isFetching } =
    useGetContentByIdQuery(currentContent?.id || "", {
      skip: !currentContent?.id,
    });

  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

  useEffect(() => {
    if (existingContent) {
      setFormData({
        title: existingContent.title,
        file: null,
        duration: existingContent.duration,
        description: existingContent.description,
        tags: existingContent.tags || [],
        viewCount: existingContent.viewCount || 0,
      });
      setPreviewUrl(existingContent.url);
    }
  }, [existingContent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "viewCount" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, file }));
      if (file.type.startsWith("video/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleAddTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim().toLowerCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    if (!currentContent?.id) {
      toast.error("No content ID found");
      return;
    }

    try {
      // Prepare the updates object matching Partial<Content> type
      const updates: Partial<Content> = {
        title: formData.title,
        duration: formData.duration,
        description: formData.description,
        tags: formData.tags,
        viewCount: formData.viewCount,
      };

      // If there's a new file, we need to handle it separately
      if (formData.file) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.file);
        // Append other fields if your API expects them in FormData
        Object.entries(updates).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formDataToSend.append(key, item));
          } else {
            formDataToSend.append(key, value.toString());
          }
        });

        // You might need to adjust your API endpoint to handle FormData
        await updateContent({
          id: currentContent.id,
          updates: formDataToSend as unknown as Partial<Content>,
        }).unwrap();
      } else {
        // For non-file updates, send as regular JSON
        await updateContent({
          id: currentContent.id,
          updates,
        }).unwrap();
      }

      toast.success("Content updated successfully!");
      dispatch(closeUpdateDialog());
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  if (isFetching) {
    return (
      <Dialog
        open={isUpdateDialogOpen}
        onOpenChange={() => dispatch(closeUpdateDialog())}
      >
        <DialogContent>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isUpdateDialogOpen}
      onOpenChange={() => dispatch(closeUpdateDialog())}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Video Content</DialogTitle>
          <DialogDescription>
            Make changes to your content here. Click save when you done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Content title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds) </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px]"
              placeholder="Detailed content description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Video File</Label>
            <div className="flex items-center gap-4">
              <Label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              {previewUrl && (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                    autoPlay
                    loop
                  />
                </div>
              )}
            </div>
            {formData.file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected file: {formData.file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags </Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                className="cursor-pointer"
                type="button"
                variant="secondary"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Add at least one tag
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeUpdateDialog())}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white"
              disabled={isUpdating || formData.tags.length === 0}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Content"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
