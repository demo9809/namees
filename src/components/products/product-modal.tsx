"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  offerPrice: z.string().min(1, "Offer Price is required"),
  mrp: z.string().min(1, "MRP is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((res) => res.json()).then(setCategories);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku || "",
        barcode: product.barcode || "",
        offerPrice: product.offerPrice.toString(),
        mrp: product.mrp.toString(),
        categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : ""),
      });
      const parsedImages = product.images ? JSON.parse(product.images) : [];
      if (parsedImages.length > 0) {
        setExistingImages(parsedImages);
      } else if (product.imagePath) {
        setExistingImages([product.imagePath]);
      }
    } else {
      reset({ 
        name: "", sku: "", barcode: "", offerPrice: "", mrp: "", 
        categoryId: categories.length > 0 ? categories[0].id : "" 
      });
      setExistingImages([]);
    }
    setError("");
  }, [product, reset, isOpen, categories]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      let finalImages = [...existingImages];

      // Upload new images if provided
      if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        const files = Array.from(fileInputRef.current.files);
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "products");

          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (!uploadRes.ok) throw new Error("Failed to upload image");
          const { url } = await uploadRes.json();
          finalImages.push(url);
        }
      }

      const payload = {
        ...data,
        images: finalImages,
        imagePath: finalImages.length > 0 ? finalImages[0] : null,
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl mt-10 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Product Name</label>
            <div className="mt-2">
              <input type="text" id="name" {...register("name")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium leading-6 text-gray-900">Category</label>
              <div className="mt-2">
                <select id="categoryId" {...register("categoryId")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900 bg-white">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
              </div>
            </div>

            <label className="block text-sm font-medium leading-6 text-gray-900">Product Images</label>
            
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative group border rounded p-1">
                    <img src={img} className="h-16 w-16 object-contain" alt="Product" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow hidden group-hover:block"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/avif"
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 p-2 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple images at once.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium leading-6 text-gray-900">SKU</label>
              <div className="mt-1">
                <input type="text" id="sku" {...register("sku")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900" />
              </div>
            </div>
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium leading-6 text-gray-900">Barcode</label>
              <div className="mt-1">
                <input type="text" id="barcode" {...register("barcode")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900" />
              </div>
            </div>
            <div>
              <label htmlFor="offerPrice" className="block text-sm font-medium leading-6 text-gray-900">Offer Price</label>
              <div className="mt-1">
                <input type="number" step="0.01" id="offerPrice" {...register("offerPrice")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900" />
                {errors.offerPrice && <p className="mt-1 text-sm text-red-600">{errors.offerPrice.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="mrp" className="block text-sm font-medium leading-6 text-gray-900">MRP</label>
              <div className="mt-1">
                <input type="number" step="0.01" id="mrp" {...register("mrp")} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 text-gray-900" />
                {errors.mrp && <p className="mt-1 text-sm text-red-600">{errors.mrp.message}</p>}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-x-3 border-t border-gray-100 pt-6">
            <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 border border-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70">
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
