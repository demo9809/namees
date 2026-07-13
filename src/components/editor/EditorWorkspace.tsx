"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { CanvasElement } from "./CanvasStage";
import { useEditorStore } from "@/store/useEditorStore";
import { TopToolbar } from "./layout/TopToolbar";
import { LeftSidebar } from "./layout/LeftSidebar";
import { RightInspector } from "./layout/RightInspector";

// Disable SSR for react-konva to prevent hydration mismatch
const DynamicCanvasStage = dynamic(() => import("./CanvasStage"), { ssr: false });

export function EditorWorkspace({ template: initialTemplate }: { template: any }) {
  const store = useEditorStore();
  const { 
    template, setTemplate, 
    pages, setPages, 
    currentPageIndex, setCurrentPageIndex,
    selectedId, setSelectedId,
    setElements,
    scale, setBaseScale, setZoomLevel,
    products, setProducts,
    categories, setCategories,
    priceTags, setPriceTags,
    activePriceTagId, setActivePriceTagId
  } = store;

  const elements = pages[currentPageIndex] || [];

  const [isAutoFillOpen, setIsAutoFillOpen] = useState(false);
  const [autoFillScale, setAutoFillScale] = useState(90);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    setTemplate(initialTemplate);
    fetch("/api/products").then((res) => res.json()).then((data) => setProducts(data));
    fetch("/api/categories").then((res) => res.json()).then((data) => setCategories(data));
    fetch("/api/price-tags").then((res) => res.json()).then((data) => {
      setPriceTags(data);
      if (data.length > 0) setActivePriceTagId(data[0].id);
      else setActivePriceTagId("dynamic-shape");
    });
  }, [initialTemplate, setTemplate, setProducts, setCategories, setPriceTags, setActivePriceTagId]);

  useEffect(() => {
    if (containerRef.current && template) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const containerHeight = containerRef.current.clientHeight - 40;
      const scaleX = containerWidth / template.width;
      const scaleY = containerHeight / template.height;
      setBaseScale(Math.min(scaleX, scaleY, 1));
      setZoomLevel(1);
    }
  }, [template, setBaseScale, setZoomLevel]);

  const handleAutoFill = () => {
    try {
      const slots = JSON.parse(template?.slotsData || "[]");
      if (slots.length === 0) {
        alert("This template has no slots defined. Please edit the template to add slots first.");
        setIsAutoFillOpen(false);
        return;
      }
      
      const activeTag = priceTags.find(t => t.id === activePriceTagId);
      const productsToFill = products.filter(p => selectedProductIds.includes(p.id));
      
      const centers = slots.map((s: any) => ({ cx: s.x + s.width / 2, cy: s.y + s.height / 2 }));
      let minDx = template.width;
      let minDy = template.height;
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
           const dx = Math.abs(centers[i].cx - centers[j].cx);
           const dy = Math.abs(centers[i].cy - centers[j].cy);
           if (dx > 10 && dx < minDx) minDx = dx;
           if (dy > 10 && dy < minDy) minDy = dy;
        }
      }
      
      if (minDx === template.width) minDx = template.width / (slots.length > 1 ? slots.length : 2);
      if (minDy === template.height) minDy = template.height / 3;

      const newPages: CanvasElement[][] = [];
      for (let i = 0; i < productsToFill.length; i += slots.length) {
        const chunk = productsToFill.slice(i, i + slots.length);
        const pageElements: CanvasElement[] = [];
        
        chunk.forEach((p, index) => {
          const slot = slots[index];
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + slot.height / 2;
          const images = p.images ? JSON.parse(p.images) : [];
          const src = images.length > 0 ? images[0] : p.imagePath;
          
          const scaleFactor = autoFillScale / 100;
          const availableWidth = minDx * scaleFactor; 
          const availableHeight = minDy * scaleFactor * (0.90 / 0.95); 
          
          const x = cx - availableWidth / 2;
          const y = cy - availableHeight / 2;
          
          pageElements.push({
            id: uuidv4(),
            type: "product",
            src,
            x,
            y,
            width: availableWidth,
            height: availableHeight,
            rotation: 0,
          });
          
          const tagWidth = 150;
          const tagHeight = 120;
          const tagX = cx - tagWidth / 2;
          const tagY = cy + availableHeight / 2 - tagHeight / 2 - 20;
          
          const isDynamic = activePriceTagId === "dynamic-shape";
          const randomRotation = Math.floor(Math.random() * 21) - 10; 
          
          pageElements.push({
            id: uuidv4(),
            type: "price",
            bgType: isDynamic ? "shape" : "image",
            bgSrc: activeTag?.imagePath,
            bgColor: "#e74c3c",
            bgBorderRadius: 8,
            text: p.offerPrice?.toString() || "0",
            fontSize: 18,
            fontFamily: "Arial",
            fontWeight: "bold",
            fill: "#ffff00",
            stroke: "#000000",
            strokeWidth: 0,
            mrpText: p.mrp?.toString() || "0",
            mrpFontSize: 14,
            mrpFill: "#ffffff",
            mrpFontFamily: "Arial",
            mrpFontWeight: "normal",
            mrpFontStyle: "line-through",
            mrpVisible: p.mrp > p.offerPrice,
            showPrefix: true,
            priceLayout: 'stacked',
            x: tagX,
            y: tagY,
            width: tagWidth,
            height: tagHeight,
            rotation: randomRotation,
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const stageRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - stageRect.left) / scale;
    const y = (e.clientY - stageRect.top) / scale;

    const type = e.dataTransfer.getData("type");
    if (!type) return;
    const item = JSON.parse(e.dataTransfer.getData("item"));

    if (type === "product") {
      const images = item.images ? JSON.parse(item.images) : [];
      const src = images.length > 0 ? images[0] : item.imagePath;
      
      const productWidth = 200;
      const productHeight = 200;
      const tagWidth = 150;
      const tagHeight = 120;
      
      const activeTag = priceTags.find(t => t.id === activePriceTagId);
      const isDynamic = activePriceTagId === "dynamic-shape";
      
      setElements([
        ...elements,
        {
          id: uuidv4(),
          type: "product",
          src,
          x,
          y,
          width: productWidth,
          height: productHeight,
          rotation: 0,
        },
        {
          id: uuidv4(),
          type: "price",
          bgType: isDynamic ? "shape" : "image",
          bgSrc: activeTag?.imagePath,
          bgColor: "#e74c3c",
          bgBorderRadius: 8,
          text: item.offerPrice?.toString() || "0",
          fontSize: 18,
          fontFamily: "Arial",
          fontWeight: "bold",
          fill: "#ffff00",
          stroke: "#000000",
          strokeWidth: 0,
          mrpText: item.mrp?.toString() || "0",
          mrpFontSize: 14,
          mrpFill: "#ffffff",
          mrpFontFamily: "Arial",
          mrpFontWeight: "normal",
          mrpFontStyle: "line-through",
          mrpVisible: item.mrp > item.offerPrice,
          showPrefix: true,
          priceLayout: 'stacked',
          x: x + productWidth / 2 - tagWidth / 2, // Centered below
          y: y + productHeight - tagHeight / 2, // Overlapping slightly
          width: tagWidth,
          height: tagHeight,
          rotation: 0,
        }
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
      const isDynamic = activePriceTagId === "dynamic-shape";
      
      setElements([
        ...elements,
        {
          id: uuidv4(),
          type: "price",
          bgType: isDynamic ? "shape" : "image",
          bgSrc: activeTag?.imagePath,
          bgColor: "#e74c3c",
          bgBorderRadius: 8,
          text: item.offerPrice?.toString() || "0",
          fontSize: 18,
          fontFamily: "Arial",
          fontWeight: "bold",
          fill: "#ffff00",
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
    if (!stageRef.current || !template) return;
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
    if (!template) return;
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

  if (!template) return <div className="h-full flex items-center justify-center">Loading editor...</div>;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] w-full overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <TopToolbar 
        onAutoFillClick={() => setIsAutoFillOpen(true)}
        onExportClick={handleExport}
        onSaveClick={handleSave}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <div className="flex-1 flex flex-col relative bg-[#F8F9FA]">
          {pages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md">
              <button 
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="text-indigo-600 font-bold disabled:opacity-30 transition-opacity"
              >
                &larr; Prev
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              <button 
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="text-indigo-600 font-bold disabled:opacity-30 transition-opacity"
              >
                Next &rarr;
              </button>
            </div>
          )}

          <div 
            className="flex-1 overflow-auto relative custom-scrollbar overscroll-none"
            ref={scrollContainerRef}
            style={{ display: 'grid', placeItems: 'safe center', padding: '4rem' }}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div
              ref={containerRef}
              onDrop={handleDrop}
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

        <RightInspector />
      </div>

      {isAutoFillOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Auto-Fill Grid</h3>
              
              <div className="w-1/2">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Product Size & Gap</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{autoFillScale}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={autoFillScale}
                onChange={(e) => setAutoFillScale(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wider">
                <span>More Gap</span>
                <span>Larger Product</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Select products to automatically fill the marked slots on this template. If you select more products than slots, multiple pages will be generated.
            </p>
            
            <div className="mb-3 px-1 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={selectedProductIds.length === products.length && products.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(products.filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId).map(p => p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Select All
              </label>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{selectedProductIds.length} Selected</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar border rounded-xl p-2 bg-gray-50">
              <div className="grid grid-cols-4 gap-2">
                {products
                  .filter(p => selectedCategoryId === "all" || p.categoryId === selectedCategoryId)
                  .map(p => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const images = p.images ? JSON.parse(p.images) : [];
                    const src = images.length > 0 ? images[0] : p.imagePath;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                          } else {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          }
                        }}
                        className={`cursor-pointer border rounded-xl p-2 flex flex-col items-center transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
                      >
                        {src ? (
                          <img src={src} alt={p.name} className="h-16 w-16 object-contain mix-blend-multiply drop-shadow-sm" />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg"></div>
                        )}
                        <span className="text-[10px] mt-2 truncate w-full text-center font-medium text-gray-700">{p.name}</span>
                      </div>
                    );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsAutoFillOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoFill}
                disabled={selectedProductIds.length === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center gap-2"
              >
                Generate Poster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
