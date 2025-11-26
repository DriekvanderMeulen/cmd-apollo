"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { HiOutlineArrowDownTray, HiOutlineTrash, HiOutlineVideoCamera } from "react-icons/hi2";

interface VideoUploadProps {
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  existingVideoUrl?: string;
  existingVideoKey?: string | null;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function VideoUpload({
  onUpload,
  onDelete,
  existingVideoUrl,
  existingVideoKey,
  className = "",
}: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return "Please select a valid video file (MP4, WebM, or MOV)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Video file must be smaller than 10MB";
    }
    return null;
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
        // Don't show success toast here - let parent component handle it
      } catch (error) {
        // Don't show error toast here - let parent component handle it
        // Just log it for debugging
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this video?")) return;

    setIsDeleting(true);
    try {
      await onDelete();
      // Don't show toast here - let parent component handle it
    } catch (error) {
      // Don't show toast here - let parent component handle it
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!existingVideoUrl) return;

    try {
      toast.loading("Preparing download...", { id: "download" });
      
      // Fetch the video
      const response = await fetch(existingVideoUrl);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("File not found in storage");
        }
        throw new Error("Download failed");
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Extract filename from URL or use a default
      const filename = existingVideoUrl.includes("key=")
        ? `video-${Date.now()}.mp4`
        : "video.mp4";
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Video downloaded successfully", { id: "download" });
    } catch (error: any) {
      toast.error(error.message || "Failed to download video", { id: "download" });
    }
  };

  const hasExistingFile = existingVideoKey || existingVideoUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Existing file indicator */}
      {hasExistingFile && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-700">
            Current Video File
          </label>
          
          {/* File exists card */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineVideoCamera className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">
                  Video file attached
                </p>
                {existingVideoKey && (
                  <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
                    {existingVideoKey}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {/* <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <HiOutlineArrowDownTray className="w-3.5 h-3.5" />
                    Download
                  </button> */}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optional: Video preview */}
          {existingVideoUrl && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-900 font-medium list-none flex items-center gap-2">
                <span className="inline-block w-0 h-0 border-l-4 border-l-neutral-400 border-y-4 border-y-transparent group-open:rotate-90 transition-transform"></span>
                Preview video
              </summary>
              <div className="mt-3">
                <video
                  controls
                  className="w-48 aspect-[9/16] rounded-md border border-neutral-200 object-cover bg-black"
                  src={existingVideoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Upload area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          {hasExistingFile ? "Replace Video" : "Upload Video"}
        </label>
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-neutral-300 hover:border-neutral-400"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="space-y-2">
            <div className="text-neutral-600">
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <p>Drag and drop a video file here, or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    browse to select
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Maximum file size: 10MB. Supported formats: MP4, WebM, MOV
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
