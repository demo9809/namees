"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function UploadTemplateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select a file.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a template name.");
      return;
    }

    setIsUploading(true);
    const file = fileInputRef.current.files[0];

    try {
      // Get image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      const width = img.width;
      const height = img.height;
      URL.revokeObjectURL(objectUrl);

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "templates");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");
      const { url } = await uploadRes.json();

      // Create template record
      const dbRes = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imagePath: url,
          width,
          height,
        }),
      });

      if (!dbRes.ok) throw new Error("Failed to save template");

      setIsOpen(false);
      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Upload Template
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upload Template</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900"
                  placeholder="e.g. Summer Sale A4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image File (PNG/JPEG/WEBP/AVIF)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/avif"
                  ref={fileInputRef}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 p-2 rounded-md"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
