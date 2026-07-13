import React from "react";
import { useEditorStore } from "@/store/useEditorStore";

export function LeftSidebar() {
  const { products, priceTags, activePriceTagId, setActivePriceTagId } = useEditorStore();

  const handleDragStart = (e: React.DragEvent, item: any, type: "product" | "text" | "price") => {
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  return (
    <div className="w-72 shrink-0 border-r bg-[#FAFAFA] flex flex-col h-full z-20 shadow-[1px_0_10px_rgba(0,0,0,0.03)]">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h3 className="text-sm font-bold text-gray-900">Library</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {priceTags.length > 0 && (
          <div className="mb-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Active Price Tag</h4>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => setActivePriceTagId("dynamic-shape")}
                className={`cursor-pointer rounded-xl border-[1.5px] overflow-hidden flex flex-col items-center justify-center p-1.5 transition-all bg-white shadow-sm hover:shadow-md ${activePriceTagId === "dynamic-shape" ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="w-full h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-inner">Auto Shape</div>
              </div>
              {priceTags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => setActivePriceTagId(tag.id)}
                  className={`cursor-pointer rounded-xl border-[1.5px] overflow-hidden flex flex-col items-center justify-center p-1.5 transition-all bg-white shadow-sm hover:shadow-md ${activePriceTagId === tag.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={tag.imagePath} alt={tag.name} className="w-full h-12 object-contain drop-shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Products</h4>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => {
              const images = p.images ? JSON.parse(p.images) : [];
              const src = images.length > 0 ? images[0] : p.imagePath;
              return (
                <div key={p.id} className="border border-gray-100 rounded-xl bg-white p-2 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow group">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, "product")}
                    className="cursor-move flex flex-col items-center w-full rounded-lg p-2 group-hover:bg-gray-50 transition-colors"
                  >
                    {src ? (
                      <img src={src} alt={p.name} className="h-14 w-14 object-contain pointer-events-none drop-shadow-sm" />
                    ) : (
                      <div className="h-14 w-14 bg-gray-100 rounded-lg"></div>
                    )}
                    <span className="text-[10px] mt-2 truncate w-full text-center font-medium text-gray-700">{p.name}</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, "price")}
                    className="cursor-move mt-2 bg-rose-50 text-rose-600 text-[10px] px-2 py-1 rounded-md font-bold w-full text-center border border-rose-100 hover:bg-rose-100 transition-colors"
                  >
                    Tag: SAR {p.offerPrice}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Text Elements</h4>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, { text: "Double click to edit" }, "text")}
            className="cursor-move border border-gray-200 rounded-xl bg-white p-3 hover:bg-gray-50 hover:shadow-sm transition-all text-center text-sm font-medium text-gray-700 shadow-sm"
          >
            Add Heading Text
          </div>
        </div>
      </div>
    </div>
  );
}
