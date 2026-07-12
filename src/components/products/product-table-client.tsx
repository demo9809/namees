"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductActions } from "@/components/products/product-actions";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  offerPrice: number;
  mrp: number;
  imagePath: string | null;
  category?: { id: string; name: string } | null;
}

interface ProductTableClientProps {
  products: Product[];
}

export function ProductTableClient({ products }: ProductTableClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkOfferPrice, setBulkOfferPrice] = useState("");
  const [bulkMrp, setBulkMrp] = useState("");
  
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert("Failed to delete products");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting products");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkEditPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkOfferPrice || !bulkMrp) return alert("Please fill both prices");
    
    try {
      const res = await fetch("/api/products/bulk-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: Array.from(selectedIds),
          offerPrice: parseFloat(bulkOfferPrice),
          mrp: parseFloat(bulkMrp)
        }),
      });

      if (res.ok) {
        setIsBulkEditing(false);
        setSelectedIds(new Set());
        setBulkOfferPrice("");
        setBulkMrp("");
        router.refresh();
      } else {
        alert("Failed to update prices");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating prices");
    }
  };

  return (
    <div className="mt-6 flow-root">
      {isBulkEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Edit Prices</h2>
            <p className="text-sm text-gray-500 mb-4">Editing {selectedIds.size} selected products.</p>
            <form onSubmit={handleBulkEditPrices} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Offer Price (SAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bulkOfferPrice}
                  onChange={(e) => setBulkOfferPrice(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New MRP (SAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bulkMrp}
                  onChange={(e) => setBulkMrp(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkEditing(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Update Prices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-800">
            {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBulkEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-md shadow-sm"
            >
              Bulk Edit Prices
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md shadow-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price (Offer)</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price (MRP)</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <tr key={product.id} className={isSelected ? 'bg-indigo-50/30' : undefined}>
                        <td className="relative px-7 sm:w-12 sm:px-6">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 p-1">
                              {product.imagePath ? (
                                <img className="h-8 w-8 object-contain" src={product.imagePath} alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded bg-gray-200"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.sku || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.category ? (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">SAR {product.offerPrice.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 line-through">SAR {product.mrp.toFixed(2)}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <ProductActions product={product} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
