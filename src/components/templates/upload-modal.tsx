"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UploadCloud, LayoutTemplate, Image as ImageIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const POSTER_SIZES = {
  "1080x1080": { width: 1080, height: 1080, label: "Square (1080x1080)" },
  "1080x1350": { width: 1080, height: 1350, label: "Portrait (1080x1350)" },
  "1080x1920": { width: 1080, height: 1920, label: "Story (1080x1920)" },
  "A4": { width: 2480, height: 3508, label: "A4 Portrait (2480x3508)" },
  "A3": { width: 3508, height: 4960, label: "A3 Portrait (3508x4960)" },
};

export function UploadTemplateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"classic" | "builder">("builder");
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Classic Tab State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Builder Tab State
  const [posterSize, setPosterSize] = useState<keyof typeof POSTER_SIZES>("1080x1920");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setName("");
    setError("");
    setHeaderFile(null);
    setFooterFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (headerInputRef.current) headerInputRef.current.value = "";
    if (footerInputRef.current) footerInputRef.current.value = "";
  };

  const close = () => {
    setIsOpen(false);
    resetState();
  };

  const uploadToApi = async (file: File | Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file, filename);
    formData.append("type", "templates");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.url;
  };

  const createTemplateRecord = async (data: any) => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save template to database");
  };

  const loadImage = (file: File | Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };

  const handleClassicUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select a file.");
      return;
    }
    const file = fileInputRef.current.files[0];

    try {
      const img = await loadImage(file);
      const url = await uploadToApi(file, file.name);

      await createTemplateRecord({
        name,
        imagePath: url,
        width: img.width,
        height: img.height,
        slotsData: "[]"
      });

      close();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleBuilderUpload = async () => {
    if (!headerFile && !footerFile) {
      setError("Please upload at least a Header or a Footer.");
      return;
    }

    try {
      const dims = POSTER_SIZES[posterSize];
      const canvas = document.createElement("canvas");
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not supported");

      // Draw Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, dims.width, dims.height);

      let contentStartY = 0;
      let contentEndY = dims.height;

      // Draw Header
      if (headerFile) {
        const headerImg = await loadImage(headerFile);
        const ratio = dims.width / headerImg.width;
        const scaledHeight = headerImg.height * ratio;
        ctx.drawImage(headerImg, 0, 0, dims.width, scaledHeight);
        contentStartY = scaledHeight;
      }

      // Draw Footer
      if (footerFile) {
        const footerImg = await loadImage(footerFile);
        const ratio = dims.width / footerImg.width;
        const scaledHeight = footerImg.height * ratio;
        const startY = dims.height - scaledHeight;
        ctx.drawImage(footerImg, 0, startY, dims.width, scaledHeight);
        contentEndY = startY;
      }

      // Generate Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to generate canvas blob"));
        }, "image/png");
      });

      // Upload Stitched Image
      const filename = `custom_${Date.now()}.png`;
      const url = await uploadToApi(blob, filename);

      // Auto-generate slotsData for Dynamic Content Area
      const slotWidth = dims.width * 0.9;
      const slotHeight = (contentEndY - contentStartY) * 0.95;
      const slotX = (dims.width - slotWidth) / 2;
      const slotY = contentStartY + ((contentEndY - contentStartY) - slotHeight) / 2;

      const slotsData = JSON.stringify([{
        id: uuidv4(),
        x: slotX,
        y: slotY,
        width: slotWidth,
        height: slotHeight
      }]);

      await createTemplateRecord({
        name,
        imagePath: url,
        width: dims.width,
        height: dims.height,
        slotsData
      });

      close();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a template name.");
      return;
    }

    setIsUploading(true);
    if (activeTab === "classic") {
      await handleClassicUpload();
    } else {
      await handleBuilderUpload();
    }
    setIsUploading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        New Template
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Create Template</h2>
              <button onClick={close} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${activeTab === 'builder' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                onClick={() => { setActiveTab('builder'); setError(""); }}
              >
                <LayoutTemplate className="w-4 h-4" /> Build Custom Template
              </button>
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${activeTab === 'classic' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                onClick={() => { setActiveTab('classic'); setError(""); }}
              >
                <UploadCloud className="w-4 h-4" /> Classic Upload
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  placeholder="e.g. Summer Sale 2024"
                />
              </div>

              {activeTab === "builder" && (
                <div className="space-y-4 bg-indigo-50/30 p-5 rounded-xl border border-indigo-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Poster Size</label>
                      <select
                        value={posterSize}
                        onChange={(e) => setPosterSize(e.target.value as any)}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm bg-white"
                      >
                        {Object.entries(POSTER_SIZES).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input 
                          type="text" 
                          value={bgColor} 
                          onChange={(e) => setBgColor(e.target.value)} 
                          className="flex-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 uppercase font-mono shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
                      <label className="block text-xs font-bold text-gray-700 mb-2 text-center flex items-center justify-center gap-1">
                        <ImageIcon className="w-3 h-3 text-indigo-500" /> Header Image
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        ref={headerInputRef}
                        onChange={(e) => setHeaderFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
                      <label className="block text-xs font-bold text-gray-700 mb-2 text-center flex items-center justify-center gap-1">
                        <ImageIcon className="w-3 h-3 text-indigo-500" /> Footer Image
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        ref={footerInputRef}
                        onChange={(e) => setFooterFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center italic mt-1">
                    The system will automatically scale these to fit the width and generate your content area slot in the middle.
                  </p>
                </div>
              )}

              {activeTab === "classic" && (
                <div className="bg-gray-50 p-5 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Full Background Image</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/avif"
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer max-w-xs mx-auto"
                  />
                  <p className="text-[11px] text-gray-500 text-center italic mt-3">
                    Upload a complete background. You will need to manually configure the slots after upload.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'}`}
                >
                  {isUploading ? "Processing & Uploading..." : (activeTab === "builder" ? "Build & Save Template" : "Upload Template")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
