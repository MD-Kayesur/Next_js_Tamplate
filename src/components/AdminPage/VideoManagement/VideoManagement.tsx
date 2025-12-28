"use client";
import React, { useState } from "react";
import {
  useGetVideosQuery,
  useSearchVideosQuery,
  useUploadVideoMutation,
  useDeleteVideoMutation,
  useUpdateVideoMutation,
} from "@/redux/features/auth/videoApi";
import {
  setSearchQuery,
  setIsUploading,
  setUploadProgress,
} from "@/redux/features/auth/videoSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux-hook";
import { FiUpload, FiSearch, FiPlay, FiEdit } from "react-icons/fi";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "../Shared/PageLoader";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import Title from "@/components/reuseabelComponents/Title";
import VideoFormDialog from "./VideoFormDialog";

const VideoManagement = () => {
  const [page, setPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [videoToUpdate, setVideoToUpdate] = useState<any>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const limit = 9;
  const dispatch = useAppDispatch();
  const { searchQuery, uploadProgress, isUploading } = useAppSelector(
    (state) => state.video
  );

  const {
    data: videosData,
    isLoading,
    isError,
    refetch,
  } = useGetVideosQuery({ limit, page }, { skip: !!searchQuery });

  const { data: searchResults } = useSearchVideosQuery(searchQuery, {
    skip: !searchQuery,
  });

  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();
  const [uploadVideo] = useUploadVideoMutation();
  const [updateVideo] = useUpdateVideoMutation();

  const videos = searchQuery
    ? searchResults?.data || []
    : videosData?.data || [];
  const totalVideos = searchQuery
    ? searchResults?.total || 0
    : videosData?.total || 0;
  const totalPages = Math.ceil(totalVideos / limit);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleUpload = async (formData: FormData) => {
    dispatch(setIsUploading(true));
    dispatch(setUploadProgress(0));

    const promise = uploadVideo(formData).unwrap();

    toast.promise(promise, {
      loading: "Uploading video...",
      success: "Video uploaded successfully!",
      error: "Failed to upload video",
    });

    await promise;
  };
  // In your VideoManagement component
  const handleUpdate = async (formData: FormData) => {
    if (!videoToUpdate) return;

    dispatch(setIsUploading(true));
    dispatch(setUploadProgress(0));

    try {
      const promise = updateVideo({
        id: videoToUpdate.id,
        formData,
      }).unwrap();

      toast.promise(promise, {
        loading: "Updating video...",
        success: () => {
          refetch();
          return "Video updated successfully!";
        },
        error: (error) => {
          return error.data?.message || "Failed to update video";
        },
      });

      await promise;
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      dispatch(setIsUploading(false));
      dispatch(setUploadProgress(0));
    }
  };

  const handleFormSuccess = () => {
    dispatch(setIsUploading(false));
    dispatch(setUploadProgress(0));
    refetch();
    setIsUploadModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;

    try {
      const promise = deleteVideo(videoToDelete).unwrap();

      toast.promise(promise, {
        loading: "Deleting video...",
        success: () => {
          refetch();
          return "Video deleted successfully!";
        },
        error: "Failed to delete video",
      });

      await promise;
    } catch (error) {
      console.error("Failed to delete video:", error);
    } finally {
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const handlePreviewClick = (videoUrl: string) => {
    setPreviewVideo(videoUrl);
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title title="Video Management" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[var(--color-blueOne)] hover:bg-[var(--color-accent)] text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center cursor-pointer"
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error loading videos. Please try again.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-200 border-b border-gray-300 mt-2 rounded-t-md">
                <TableRow className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
                  <TableHead className="px-4 py-3">Thumbnail</TableHead>
                  <TableHead className="cursor-pointer px-4 py-3">
                    <div className="flex items-center">Title</div>
                  </TableHead>
                  <TableHead className="cursor-pointer px-4 py-3">
                    <div className="flex items-center">Views</div>
                  </TableHead>
                  <TableHead className="px-4 py-3">Duration</TableHead>
                  <TableHead className="cursor-pointer px-4 py-3">
                    <div className="flex items-center">Status</div>
                  </TableHead>
                  <TableHead className="cursor-pointer px-4 py-3">
                    <div className="flex items-center">Date</div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {videos.length > 0 ? (
                  videos.map((video: any) => (
                    <TableRow key={video.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="relative group">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="h-12 w-20 object-cover rounded cursor-pointer"
                            onClick={() => handlePreviewClick(video.videoUrl)}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handlePreviewClick(video.videoUrl)}
                              className="bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
                            >
                              <FiPlay className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="font-medium line-clamp-1 max-w-[350px] cursor-pointer hover:text-blue-500"
                          onClick={() => handlePreviewClick(video.videoUrl)}
                        >
                          {video.title}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2 max-w-[350px]">
                          {video.description}
                        </div>
                      </TableCell>
                      <TableCell>{video.viewCount.toLocaleString()}</TableCell>
                      <TableCell>{Math.round(video.duration)}s</TableCell>
                      <TableCell>
                        <Badge
                          variant={video.isFeatured ? "default" : "secondary"}
                        >
                          {video.isFeatured ? "Featured" : "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(video.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewClick(video.videoUrl)}
                            className="text-blue-500 hover:bg-blue-100 cursor-pointer"
                          >
                            <FiPlay className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVideoToUpdate(video);
                              setIsUpdateModalOpen(true);
                            }}
                            className="text-green-500 hover:bg-green-100 cursor-pointer"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            className="text-red-500 hover:bg-red-100 hover:text-white cursor-pointer"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(video.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No videos found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!searchQuery && totalVideos > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, totalVideos)}
                </span>{" "}
                of <span className="font-medium">{totalVideos}</span> videos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                  className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D0954] hover:text-white cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-2xl mt-5">
          <DialogHeader>
            <DialogTitle>Upload New Video</DialogTitle>
          </DialogHeader>
          <VideoFormDialog
            mode="create"
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={handleFormSuccess}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onSubmit={handleUpload}
          />
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-2xl mt-5">
          <DialogHeader>
            <DialogTitle>Update Video</DialogTitle>
          </DialogHeader>
          {videoToUpdate && (
            <VideoFormDialog
              mode="update"
              video={videoToUpdate}
              onClose={() => setIsUpdateModalOpen(false)}
              onSuccess={handleFormSuccess}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {previewVideo && (
            <div className="aspect-video w-full">
              <video
                controls
                autoPlay
                className="w-full h-full rounded-lg bg-black"
              >
                <source src={previewVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the video and all its data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Video"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoManagement;
