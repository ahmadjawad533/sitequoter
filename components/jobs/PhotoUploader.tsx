"use client";

import * as React from "react";
import { Camera, Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { compressImage } from "@/lib/image/compressor";
import { Button } from "@/components/ui/button";

export interface StoredPhoto {
  file: File;
  previewUrl: string;
}

interface PhotoUploaderProps {
  photos: StoredPhoto[];
  onChange: (photos: StoredPhoto[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 6,
}: PhotoUploaderProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const remainingSlots = maxPhotos - photos.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    setIsProcessing(true);

    try {
      const selectedFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (selectedFiles.length === 0) {
        setPhotoError("Please select valid image files.");
        setIsProcessing(false);
        return;
      }

      if (selectedFiles.length > remainingSlots) {
        setPhotoError(
          `Only ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} allowed. First ${remainingSlots} added.`
        );
      }

      const filesToProcess = selectedFiles.slice(0, remainingSlots);

      const processed = await Promise.all(
        filesToProcess.map((file) => compressImage(file))
      );

      onChange([...photos, ...processed]);
    } catch (err: any) {
      setPhotoError(err?.message || "Failed to process photos.");
    } finally {
      setIsProcessing(false);
      // Reset input values so same file can be re-selected if desired
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    // Revoke object URL to avoid memory leak
    if (updated[index]?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].previewUrl);
    }
    updated.splice(index, 1);
    onChange(updated);
    setPhotoError(null);
  };

  return (
    <div className="space-y-3">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#111827]">
          Job photos
        </label>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            photos.length === maxPhotos
              ? "bg-[#FEF3C7] text-[#92400E]"
              : "bg-[#F3F4F6] text-[#4B5563]"
          }`}
        >
          {photos.length}/{maxPhotos}
        </span>
      </div>

      {/* Hidden file inputs: one with capture="environment" for direct camera on phones, one standard */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Error alert if any */}
      {photoError && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626]">
          {photoError}
        </div>
      )}

      {/* Photo Preview Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt={`Job photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827]/80 text-white hover:bg-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X className="h-4 w-4" />
            </button>
            <span className="absolute bottom-1 left-1 rounded bg-[#111827]/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              #{index + 1}
            </span>
          </div>
        ))}

        {/* Add photo action buttons if under limit */}
        {photos.length < maxPhotos && (
          <div className="flex flex-col gap-1.5 aspect-square">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:bg-[#EFF6FF] transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#1D4ED8]" />
              ) : (
                <>
                  <Camera className="h-5 w-5 mb-0.5" />
                  <span className="text-[11px] font-medium">Camera</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] font-medium">Upload</span>
            </button>
          </div>
        )}
      </div>

      {/* Helpful guidance */}
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Capture equipment nameplate, full unit layout, and damaged parts.
        Photos are compressed before saving.
      </p>
    </div>
  );
}
