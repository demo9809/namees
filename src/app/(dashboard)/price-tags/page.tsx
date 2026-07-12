import { db } from "@/lib/db";
import { UploadPriceTagModal } from "@/components/price-tags/upload-modal";

export default async function PriceTagsPage() {
  const priceTags = await db.priceTag.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-7 text-gray-900">Price Tags</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your library of custom price tag graphics used across your promotional posters.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <UploadPriceTagModal />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {priceTags.map((tag) => (
          <div key={tag.id} className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-gray-100 sm:aspect-[2/1] lg:aspect-[4/3]">
              <img
                src={tag.imagePath}
                alt={tag.name}
                className="h-full w-full object-contain object-center p-4"
              />
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-4">
              <h3 className="text-sm font-medium text-gray-900">{tag.name}</h3>
              <p className="text-sm text-gray-500 text-xs">
                Added {tag.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {priceTags.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="mt-2 text-sm font-semibold text-gray-900">No price tags</p>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first price tag graphic.</p>
          </div>
        )}
      </div>
    </div>
  );
}
