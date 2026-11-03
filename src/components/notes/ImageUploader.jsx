"use client";

import { useState, useRef } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader({ noteId, images = [], onImageAdded, onImageDeleted }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const showSuccessMsg = (msg) => {
    setUploadSuccess(msg);
    setTimeout(() => setUploadSuccess(""), 4000);
  };

  const uploadFile = async (file) => {
    setUploadError("");
    setUploadSuccess("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`Unsupported file type. Use JPG, PNG, GIF, WebP, or SVG.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);

    try {
      // 1. Get presigned URL from backend
      const presignRes = await fetch(`/api/notes/${noteId}/images/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presignData.message || "Failed to get upload URL.");
      }

      const { presignedUrl, s3Key } = presignData;

      // 2. Upload directly to S3 using the presigned PUT URL
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Failed to upload image to storage. Please try again.");
      }

      // 3. Register the image in the DB
      const registerRes = await fetch(`/api/notes/${noteId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.message || "Failed to register image.");
      }

      onImageAdded(registerData.image);
      showSuccessMsg(`"${file.name}" uploaded successfully!`);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (image) => {
    setDeletingId(image._id);
    try {
      const res = await fetch(`/api/notes/${noteId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: image._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed.");

      onImageDeleted(image._id);
    } catch (err) {
      setUploadError(err.message || "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-brand-500 bg-blue-50"
            : "border-slate-200 hover:border-brand-400 hover:bg-blue-50/30"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-brand-500" />
            <p className="text-sm font-semibold text-brand-600">Uploading to S3…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Drop an image here, or{" "}
                <span className="text-brand-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPG, PNG, GIF, WebP, SVG — up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
          <AlertCircle size={15} className="shrink-0" />
          <span>{uploadError}</span>
          <button onClick={() => setUploadError("")} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-fade-in">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Attached Images ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image._id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt={image.fileName || "Note image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image)}
                    disabled={deletingId === image._id}
                    className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    aria-label={`Delete ${image.fileName}`}
                  >
                    {deletingId === image._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* File name tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{image.fileName}</p>
                  {image.fileSize && (
                    <p className="text-[9px] text-white/70">{formatBytes(image.fileSize)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ImageIcon size={14} />
          <span>No images attached yet. Upload diagrams, screenshots, or handwritten notes.</span>
        </div>
      )}
    </div>
  );
}
