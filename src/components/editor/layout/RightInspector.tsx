import React from "react";
import { Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";

export function RightInspector() {
  const { pages, currentPageIndex, selectedId, updateElement, setPages, deleteElement } = useEditorStore();
  const elements = pages[currentPageIndex] || [];
  const selectedElement = elements.find((e) => e.id === selectedId);

  if (!selectedId || !selectedElement) return null;

  const updateSelectedElement = (updates: Partial<any>) => {
    updateElement(selectedId, updates);
  };

  return (
    <div className="w-80 shrink-0 border-l border-gray-100 bg-white flex flex-col h-full z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Properties</h3>
        <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider">
          {selectedElement.type}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {selectedElement.type === "product-group" && (
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Product Name</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Show Name</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={selectedElement.productNameVisible !== false} onChange={(e) => updateSelectedElement({ productNameVisible: e.target.checked })} />
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            {selectedElement.productNameVisible !== false && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name Text</label>
                  <textarea
                    value={selectedElement.productName || ""}
                    onChange={(e) => updateSelectedElement({ productName: e.target.value })}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedElement.productNameFontSize || 16}
                      onChange={(e) => updateSelectedElement({ productNameFontSize: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Color</label>
                    <div className="flex items-center gap-2 block w-full rounded-lg border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                      <input
                        type="color"
                        value={selectedElement.productNameColor || "#000000"}
                        onChange={(e) => updateSelectedElement({ productNameColor: e.target.value })}
                        className="h-6 w-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {(selectedElement.type === "text" || selectedElement.type === "price" || selectedElement.type === "product-group") && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Text Content</label>
              <textarea
                value={selectedElement.text}
                onChange={(e) => updateSelectedElement({ text: e.target.value })}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Size</label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 32}
                  onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Color</label>
                <div className="flex items-center gap-2 block w-full rounded-lg border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                  <input
                    type="color"
                    value={selectedElement.fill || "#000000"}
                    onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                    className="h-6 w-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-medium text-gray-600 uppercase font-mono">{selectedElement.fill || "#000000"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stroke Width</label>
                <input
                  type="number"
                  value={selectedElement.strokeWidth || 0}
                  onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) || 0 })}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Stroke Color</label>
                <div className="flex items-center gap-2 block w-full rounded-lg border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                  <input
                    type="color"
                    value={selectedElement.stroke || "#000000"}
                    onChange={(e) => updateSelectedElement({ stroke: e.target.value })}
                    className="h-6 w-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-medium text-gray-600 uppercase font-mono">{selectedElement.stroke || "#000000"}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Typography</label>
              <select
                value={selectedElement.fontFamily || "Arial"}
                onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all mb-3 shadow-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Open Sans">Open Sans</option>
              </select>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={selectedElement.fontWeight || "normal"}
                  onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
                <select
                  value={selectedElement.fontStyle || "normal"}
                  onChange={(e) => updateSelectedElement({ fontStyle: e.target.value })}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateSelectedElement({ align })}
                    className={`flex-1 py-1 text-[11px] font-medium rounded capitalize transition-all ${selectedElement.align === align ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {(selectedElement.type === "price" || selectedElement.type === "product-group") && (
          <div className="pt-6 border-t border-gray-100 space-y-6">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Regular Price (MRP)</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Show MRP</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={selectedElement.mrpVisible !== false} onChange={(e) => updateSelectedElement({ mrpVisible: e.target.checked })} />
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {selectedElement.mrpVisible !== false && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">MRP Text</label>
                  <input
                    type="text"
                    value={selectedElement.mrpText || ""}
                    onChange={(e) => updateSelectedElement({ mrpText: e.target.value })}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">MRP Size</label>
                    <input
                      type="number"
                      value={selectedElement.mrpFontSize || 20}
                      onChange={(e) => updateSelectedElement({ mrpFontSize: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">MRP Color</label>
                    <div className="flex items-center gap-2 block w-full rounded-lg border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                      <input
                        type="color"
                        value={selectedElement.mrpFill || "#ff0000"}
                        onChange={(e) => updateSelectedElement({ mrpFill: e.target.value })}
                        className="h-6 w-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">MRP Typography</label>
                  <select
                    value={selectedElement.mrpFontFamily || "Arial"}
                    onChange={(e) => updateSelectedElement({ mrpFontFamily: e.target.value })}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all mb-3 shadow-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <select
                      value={selectedElement.mrpFontWeight || "normal"}
                      onChange={(e) => updateSelectedElement({ mrpFontWeight: e.target.value })}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                    <select
                      value={selectedElement.mrpFontStyle || "line-through"}
                      onChange={(e) => updateSelectedElement({ mrpFontStyle: e.target.value })}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="line-through">Line-through</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {/* Tag Background Settings */}
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-6 border-t border-gray-100">Tag Background</h4>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => updateSelectedElement({ bgType: 'image' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded capitalize transition-all ${selectedElement.bgType !== 'shape' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Image
              </button>
              <button
                onClick={() => updateSelectedElement({ bgType: 'shape' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded capitalize transition-all ${selectedElement.bgType === 'shape' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Dynamic Shape
              </button>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-700">Show 'SAR' Prefix</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={selectedElement.showPrefix !== false} onChange={(e) => updateSelectedElement({ showPrefix: e.target.checked })} />
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-100">Layout Style</h4>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['stacked', 'side-by-side'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => updateSelectedElement({ priceLayout: layout as any })}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded capitalize transition-all ${selectedElement.priceLayout === layout || (!selectedElement.priceLayout && layout === 'stacked') ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {layout.replace(/-/g, ' ')}
                </button>
              ))}
            </div>

            {(selectedElement.bgType === 'shape' || !selectedElement.bgSrc) && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tag Background</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Color</label>
                    <div className="flex items-center gap-2 block w-full rounded-lg border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
                      <input
                        type="color"
                        value={selectedElement.bgColor || "#e74c3c"}
                        onChange={(e) => updateSelectedElement({ bgColor: e.target.value })}
                        className="h-6 w-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Corner Radius</label>
                    <input
                      type="number"
                      value={selectedElement.bgBorderRadius !== undefined ? selectedElement.bgBorderRadius : 8}
                      onChange={(e) => updateSelectedElement({ bgBorderRadius: parseInt(e.target.value) || 0 })}
                      className="block w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const styleProps = {
                    fontSize: selectedElement.fontSize,
                    fill: selectedElement.fill,
                    stroke: selectedElement.stroke,
                    strokeWidth: selectedElement.strokeWidth,
                    fontFamily: selectedElement.fontFamily,
                    fontWeight: selectedElement.fontWeight,
                    fontStyle: selectedElement.fontStyle,
                    mrpFontSize: selectedElement.mrpFontSize,
                    mrpFill: selectedElement.mrpFill,
                    mrpFontFamily: selectedElement.mrpFontFamily,
                    mrpFontWeight: selectedElement.mrpFontWeight,
                    mrpFontStyle: selectedElement.mrpFontStyle,
                    mrpVisible: selectedElement.mrpVisible,
                    showPrefix: selectedElement.showPrefix,
                    priceLayout: selectedElement.priceLayout,
                    width: selectedElement.width,
                    height: selectedElement.height,
                    bgType: selectedElement.bgType,
                    bgSrc: selectedElement.bgSrc,
                    bgColor: selectedElement.bgColor,
                    bgBorderRadius: selectedElement.bgBorderRadius,
                    bgBorderColor: selectedElement.bgBorderColor,
                    bgBorderWidth: selectedElement.bgBorderWidth,
                    productNameVisible: selectedElement.productNameVisible,
                    productNameFontSize: selectedElement.productNameFontSize,
                    productNameColor: selectedElement.productNameColor
                  };
                  setPages(pages.map(page => 
                    page.map(el => (el.type === 'price' || el.type === 'product-group') ? { ...el, ...styleProps } : el)
                  ));
                  alert("Style applied to all products and price tags!");
                }}
                className="w-full py-2 px-4 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
              >
                Apply Style to All Products & Tags
              </button>
            </div>
          </div>
        )}

        {selectedElement.type === "product" && (
          <div className="space-y-4">
            <div className="bg-indigo-50/50 text-indigo-800 p-4 rounded-xl text-sm border border-indigo-100 shadow-sm">
              <p className="font-bold mb-1 text-[11px] uppercase tracking-wider">Image Selected</p>
              <p className="opacity-80 text-xs">Use the blue corner handles on the canvas to seamlessly resize and rotate this product image.</p>
            </div>
          </div>
        )}

      </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all shadow-sm active:scale-95"
            onClick={() => {
              deleteElement(selectedId);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete Element
          </button>
        </div>
    </div>
  );
}
