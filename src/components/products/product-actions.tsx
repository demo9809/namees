"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductModal } from "./product-modal";

export function ProductActions({ product }: { product: any }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      router.refresh();
    }
  };

  return (
    <div className="flex justify-end gap-3 items-center">
      <button onClick={() => setIsEditOpen(true)} className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
      <button onClick={handleDelete} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
      <ProductModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} product={product} />
    </div>
  );
}
