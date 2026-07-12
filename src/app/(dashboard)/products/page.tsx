import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { BulkImportModal } from "@/components/products/bulk-import-modal";
import { ProductActions } from "@/components/products/product-actions";
import { AddProductButton } from "@/components/products/add-product-button";
import { ProductTableClient } from "@/components/products/product-table-client";
import { CategoryFilter } from "@/components/products/category-filter";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const categoryFilter = resolvedParams.category || "";

  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  });

  const products = await db.product.findMany({
    where: {
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { barcode: { contains: q } }
        ]
      } : {}),
      ...(categoryFilter ? { categoryId: categoryFilter } : {})
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Product Library</h1>
          <p className="mt-2 text-sm text-gray-700">
            A comprehensive list of all products available for your poster campaigns.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
          <BulkImportModal />
          <AddProductButton />
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-4">
        <form className="relative max-w-md flex-1 flex gap-2" method="GET">
          <div className="relative flex-1">
            <label htmlFor="search-products" className="sr-only">Search products</label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 pl-2 text-gray-400" aria-hidden="true" />
            <input
              id="search-products"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search by SKU, Barcode, or Name..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          <CategoryFilter categories={categories} categoryFilter={categoryFilter} />
        </form>
      </div>

      <ProductTableClient products={products} />
    </div>
  );
}
