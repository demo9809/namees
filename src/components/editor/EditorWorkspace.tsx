"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { CanvasElement } from "./CanvasStage";
import { Download, Plus, ZoomIn, ZoomOut, Maximize, Wand2, Trash2 } from "lucide-react";

// Disable SSR for react-konva to prevent hydration mismatch
const DynamicCanvasStage = dynamic(() => import("./CanvasStage"), { ssr: false });

export function EditorWorkspace({ template }: { template: any }) {
  const [pages, setPages] = useState<CanvasElement[][]>([[]]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const elements = pages[currentPageIndex] || [];
  
  const setElements = (newOrUpdater: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    setPages(prevPages => {
      const updated = [...prevPages];
      const currentElements = updated[currentPageIndex] || [];
      updated[currentPageIndex] = typeof newOrUpdater === 'function' ? newOrUpdater(currentElements) : newOrUpdater;
      return updated;
    });
  };

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [priceTags, setPriceTags] = useState<any[]>([]);
  const [activePriceTagId, setActivePriceTagId] = useState<string>("");
  
  const [isAutoFillOpen, setIsAutoFillOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  
  const [baseScale, setBaseScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scale = baseScale * zoomLevel;

  useEffect(() => {
    fetch("/api/products").then((res) => res.json()).then((data) => setProducts(data));
    fetch("/api/categories").then((res) => res.json()).then((data) => setCategories(data));
    fetch("/api/price-tags").then((res) => res.json()).then((data) => {
      setPriceTags(data);
      if (data.length > 0) setActivePriceTagId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const containerHeight = containerRef.current.clientHeight - 40;
      const scaleX = containerWidth / template.width;
      const scaleY = containerHeight / template.height;
      setBaseScale(Math.min(scaleX, scaleY, 1));
      setZoomLevel(1);
    }
  }, [template]);

  const handleAutoFill = () => {
    try {
      const slots = JSON.parse(template.slotsData || "[]");
      if (slots.length === 0) {
        alert("This template has no slots defined. Please edit the template to add slots first.");
        setIsAutoFillOpen(false);
        return;
      }
      
      const activeTag = priceTags.find(t => t.id === activePriceTagId);
      
      const productsToFill = products.filter(p => selectedProductIds.includes(p.id));
      
      const newPages: CanvasElement[][] = [];
      for (let i = 0; i < productsToFill.length; i += slots.length) {
        const chunk = productsToFill.slice(i, i + slots.length);
        const pageElements: CanvasElement[] = [];
        
        chunk.forEach((p, index) => {
          const slot = slots[index];
          const images = p.images ? JSON.parse(p.images) : [];
          const src = images.length > 0 ? images[0] : p.imagePath;
          
          const padding = 20;
          const imgWidth = slot.width - (padding * 2);
          const imgHeight = slot.height - (padding * 2);
          const x = slot.x + padding;
          const y = slot.y + padding;
          
          pageElements.push({
            id: uuidv4(),
            type: "product",
            src,
            x,
            y,
            width: imgWidth,
            height: imgHeight,
            rotation: 0,
          });
          
          const tagWidth = 150;
          const tagHeight = 120;
          const tagX = slot.x + (slot.width - tagWidth) / 2;
          const tagY = slot.y + slot.height - tagHeight + 10;
          
          pageElements.push({
            id: uuidv4(),
            type: "price",
            bgSrc: activeTag?.imagePath,
            text: p.offerPrice?.toString() || "0",
            fontSize: 18,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#ffff00", // Yellow
            stroke: "#000000",
            strokeWidth: 0,
            mrpText: p.mrp?.toString() || "0",
            mrpFontSize: 14,
            mrpFill: "#ffffff",
            mrpFontFamily: "Arial",
            mrpFontWeight: "normal",
            mrpFontStyle: "line-through", // usually MRP has strike
            mrpVisible: p.mrp > p.offerPrice,
            showPrefix: true,
            priceLayout: 'stacked',
            x: tagX,
            y: tagY,
            width: tagWidth,
            height: tagHeight,
          });
        });
        
        newPages.push(pageElements);
      }
      
      if (newPages.length > 0) {
        setPages(newPages);
        setCurrentPageIndex(0);
      }
      setIsAutoFillOpen(false);
      setSelectedProductIds([]);
    } catch (e) {
      console.error(e);
      alert("Error auto-filling grid.");
    }
  };

  const handleDragStart = (e: React.DragEvent, item: any, type: "product" | "text" | "price") => {
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const stageRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - stageRect.left) / scale;
    const y = (e.clientY - stageRect.top) / scale;

    const type = e.dataTransfer.getData("type");
    const item = JSON.parse(e.dataTransfer.getData("item"));

    if (type === "product") {
      const images = item.images ? JSON.parse(item.images) : [];
      const src = images.length > 0 ? images[0] : item.imagePath;
      setElements([
        ...elements,
        {
          id: uuidv4(),
          type: "product",
          src,
          x,
          y,
          width: 200,
          height: 200,
          rotation: 0,
        },
      ]);
    } else if (type === "text") {
      setElements([
        ...elements,
        {
          id: uuidv4(),
          type: "text",
          text: item.text,
          fontSize: 48,
          fontFamily: "Arial",
          fontWeight: "normal",
          fontStyle: "normal",
          align: "left",
          fill: "#000000",
          x,
          y,
        },
      ]);
    } else if (type === "price") {
      const activeTag = priceTags.find(t => t.id === activePriceTagId);
      setElements([
        ...elements,
        {
          id: uuidv4(),
          type: "price",
          bgSrc: activeTag?.imagePath,
          text: item.offerPrice?.toString() || "0",
          fontSize: 18,
          fontFamily: "Arial",
          fontWeight: "bold",
          fill: "#ffff00", // Yellow
          stroke: "#000000",
          strokeWidth: 0,
          mrpText: item.mrp?.toString() || "0",
          mrpFontSize: 14,
          mrpFill: "#ffffff",
          mrpFontFamily: "Arial",
          mrpFontWeight: "normal",
          mrpFontStyle: "line-through",
          mrpVisible: true,
          showPrefix: true,
          priceLayout: 'stacked',
          x,
          y,
          width: 150,
          height: 150,
        },
      ]);
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const exportPixelRatio = 2 / scale;
    const uri = stageRef.current.toDataURL({ pixelRatio: exportPixelRatio });
    const link = document.createElement("a");
    link.download = `${template.name.replace(/\s+/g, '_')}_export.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} - Draft`,
          templateId: template.id,
          canvasData: JSON.stringify(pages),
        }),
      });
      if (res.ok) alert("Poster saved successfully!");
      else alert("Failed to save poster.");
    } catch (e) {
      alert("Error saving poster.");
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId);

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements(elements.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full overflow-x-auto overflow-y-hidden bg-gray-100 custom-scrollbar overscroll-none">
      <div className="w-64 shrink-0 border-r bg-white p-4 overflow-y-auto custom-scrollbar overscroll-contain">
        <h3 className="font-semibold text-gray-900 mb-4">Library</h3>
        
        {priceTags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Active Price Tag</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {priceTags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => setActivePriceTagId(tag.id)}
                  className={`cursor-pointer rounded-md border-2 overflow-hidden flex flex-col items-center justify-center p-1 hover:border-blue-400 transition-all ${activePriceTagId === tag.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                >
                  <img src={tag.imagePath} alt={tag.name} className="w-full h-12 object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Products</h4>
          <div className="grid grid-cols-2 gap-2">
            {products.map((p) => {
              const images = p.images ? JSON.parse(p.images) : [];
              const src = images.length > 0 ? images[0] : p.imagePath;
              return (
                <div key={p.id} className="border rounded bg-gray-50 p-2 flex flex-col items-center">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, "product")}
                    className="cursor-move hover:bg-gray-100 flex flex-col items-center w-full"
                  >
                    {src ? (
                      <img src={src} alt={p.name} className="h-12 w-12 object-contain pointer-events-none" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    )}
                    <span className="text-xs mt-1 truncate w-full text-center">{p.name}</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, "price")}
                    className="cursor-move mt-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold"
                  >
                    Tag: SAR {p.offerPrice}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Text Elements</h4>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, { text: "Double click to edit" }, "text")}
            className="cursor-move border rounded bg-gray-50 p-2 hover:bg-gray-100 text-center text-sm font-medium"
          >
            Add Heading
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-[500px] flex flex-col">
        <div className="h-14 border-b bg-white flex items-center justify-between px-4">
          <span className="font-medium text-gray-900">{template.name}</span>
          
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200">
            <button onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))} className="p-1 hover:bg-gray-200 rounded text-gray-600"><ZoomOut className="h-4 w-4" /></button>
            <span className="text-xs font-medium w-12 text-center text-gray-600">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(zoomLevel + 0.1)} className="p-1 hover:bg-gray-200 rounded text-gray-600"><ZoomIn className="h-4 w-4" /></button>
            <button onClick={() => setZoomLevel(1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 border-l border-gray-300 ml-1 pl-2"><Maximize className="h-4 w-4" /></button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsAutoFillOpen(true)}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-bold text-white hover:from-indigo-400 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" /> Auto-Fill
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-white/80 border border-gray-200/50 backdrop-blur px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow transition-all"
            >
              Save Draft
            </button>
            <button
              onClick={handleExport}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Export PNG
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#F3F4F6] relative">
          
          {pages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <button 
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="text-indigo-600 font-bold disabled:opacity-30"
              >
                &larr; Prev
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <button 
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="text-indigo-600 font-bold disabled:opacity-30"
              >
                Next &rarr;
              </button>
            </div>
          )}

          <div 
            className="flex-1 overflow-auto custom-scrollbar relative overscroll-none"
            ref={scrollContainerRef}
            style={{ display: 'grid', placeItems: 'safe center', padding: '2rem' }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div
                ref={containerRef}
                onDrop={(e) => { handleDrop(e); }}
                onDragOver={(e) => e.preventDefault()}
                className="shadow-2xl bg-white relative z-10 transition-transform duration-200 ease-out rounded-sm"
                style={{ width: template.width * scale, height: template.height * scale }}
              >
              <DynamicCanvasStage
                template={template}
                elements={elements}
                setElements={setElements}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                scale={scale}
                stageRef={stageRef}
              />
            </div>
          </div>
        </div>
      </div>
      
      {selectedId && selectedElement && (
        <div className="w-80 shrink-0 border-l border-gray-100 bg-white p-6 overflow-y-auto custom-scrollbar overscroll-contain shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Properties</h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider">
              {selectedElement.type}
            </span>
          </div>
          
          {(selectedElement.type === "text" || selectedElement.type === "price") && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Text Content</label>
                <textarea
                  value={selectedElement.text}
                  onChange={(e) => updateSelectedElement({ text: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Size</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize || 32}
                    onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                  <div className="flex items-center gap-2 block w-full rounded-xl border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input
                      type="color"
                      value={selectedElement.fill || "#000000"}
                      onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-medium text-gray-600 uppercase font-mono">{selectedElement.fill || "#000000"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stroke Width</label>
                  <input
                    type="number"
                    value={selectedElement.strokeWidth || 0}
                    onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) || 0 })}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stroke Color</label>
                  <div className="flex items-center gap-2 block w-full rounded-xl border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input
                      type="color"
                      value={selectedElement.stroke || "#000000"}
                      onChange={(e) => updateSelectedElement({ stroke: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-medium text-gray-600 uppercase font-mono">{selectedElement.stroke || "#000000"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Typography</label>
                <select
                  value={selectedElement.fontFamily || "Arial"}
                  onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all mb-3"
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
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                  <select
                    value={selectedElement.fontStyle || "normal"}
                    onChange={(e) => updateSelectedElement({ fontStyle: e.target.value })}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateSelectedElement({ align })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${selectedElement.align === align ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {selectedElement.type === "price" && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regular Price (MRP)</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show MRP</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={selectedElement.mrpVisible !== false} onChange={(e) => updateSelectedElement({ mrpVisible: e.target.checked })} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {selectedElement.mrpVisible !== false && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MRP Text</label>
                    <input
                      type="text"
                      value={selectedElement.mrpText || ""}
                      onChange={(e) => updateSelectedElement({ mrpText: e.target.value })}
                      className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MRP Size</label>
                      <input
                        type="number"
                        value={selectedElement.mrpFontSize || 20}
                        onChange={(e) => updateSelectedElement({ mrpFontSize: parseInt(e.target.value) })}
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MRP Color</label>
                      <div className="flex items-center gap-2 block w-full rounded-xl border border-gray-200 bg-gray-50 p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <input
                          type="color"
                          value={selectedElement.mrpFill || "#ff0000"}
                          onChange={(e) => updateSelectedElement({ mrpFill: e.target.value })}
                          className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">MRP Typography</label>
                    <select
                      value={selectedElement.mrpFontFamily || "Arial"}
                      onChange={(e) => updateSelectedElement({ mrpFontFamily: e.target.value })}
                      className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all mb-3"
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
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                      <select
                        value={selectedElement.mrpFontStyle || "line-through"}
                        onChange={(e) => updateSelectedElement({ mrpFontStyle: e.target.value })}
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 p-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                        <option value="line-through">Line-through</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-medium text-gray-700">Show 'SAR' Prefix</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={selectedElement.showPrefix !== false} onChange={(e) => updateSelectedElement({ showPrefix: e.target.checked })} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout Style</h4>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['stacked', 'side-by-side'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => updateSelectedElement({ priceLayout: layout as any })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${selectedElement.priceLayout === layout || (!selectedElement.priceLayout && layout === 'stacked') ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {layout.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>

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
                      height: selectedElement.height
                    };
                    setPages(prevPages => prevPages.map(page => 
                      page.map(el => el.type === 'price' ? { ...el, ...styleProps } : el)
                    ));
                    alert("Style and size applied to all price tags!");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all"
                >
                  Apply Style to All Price Tags
                </button>
              </div>
            </div>
          )}

          {selectedElement.type === "product" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm border border-indigo-100">
                <p className="font-semibold mb-1">Image Selected</p>
                <p className="opacity-80">Use the blue corner handles on the canvas to seamlessly resize and rotate this product image.</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all"
              onClick={() => {
                setElements(elements.filter((e) => e.id !== selectedId));
                setSelectedId(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete Element
            </button>
          </div>
        </div>
      )}

      {isAutoFillOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl flex flex-col max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Auto-Fill Grid</h3>
              
              <div className="w-1/2">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border p-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Select products to automatically fill the marked slots on this template. If you select more products than slots, multiple pages will be generated!
            </p>
            
            <div className="mb-3 px-1 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={
                    products.filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId).length > 0 &&
                    products.filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId)
                      .every(p => selectedProductIds.includes(p.id))
                  }
                  onChange={(e) => {
                    const filteredProducts = products.filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId);
                    if (e.target.checked) {
                      const newIds = new Set([...selectedProductIds, ...filteredProducts.map(p => p.id)]);
                      setSelectedProductIds(Array.from(newIds));
                    } else {
                      const filteredIds = filteredProducts.map(p => p.id);
                      setSelectedProductIds(selectedProductIds.filter(id => !filteredIds.includes(id)));
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Select All
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto mb-6 p-1">
              {products.filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId).map(p => (
                <label key={p.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input 
                    type="checkbox" 
                    className="mt-1"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                      else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                    }}
                  />
                  <span className="text-sm font-medium">{p.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAutoFillOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                Cancel
              </button>
              <button 
                onClick={handleAutoFill} 
                disabled={selectedProductIds.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50"
              >
                Auto-Fill ({selectedProductIds.length}) Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
