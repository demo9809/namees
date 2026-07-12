"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

export function UploadPriceTagModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      const { url } = await uploadRes.json();
      const name = file.name.split(".")[0].replace(/[-_]/g, " ");

      // Create price tag record
      const priceTagRes = await fetch("/api/price-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imagePath: url }),
      });

      if (!priceTagRes.ok) throw new Error("Failed to save price tag");

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <Upload className="h-4 w-4" />
        Upload Price Tag
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Price Tag Style</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? "Uploading..." : "Click to select a file"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, AVIF, SVG up to 10MB</p>
            </div>
            
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/avif, image/svg+xml"
              onChange={handleFileChange} 
              disabled={isUploading}
            />
          </div>
        </div>
      )}
    </>
  );
}
