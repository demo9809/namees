"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductModal } from "./product-modal";

export function AddProductButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Add Product
      </button>
      <ProductModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
