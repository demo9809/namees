"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import useImage from "use-image";
import { Trash2 } from "lucide-react";

export interface Slot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function TemplateSlotEditor({ template }: { template: any }) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [bgImage] = useImage(template.imagePath, "anonymous");
  
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(3);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const trRef = useRef<any>(null);
  const rectRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(template.slotsData);
      setSlots(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSlots([]);
    }
  }, [template]);

  useEffect(() => {
    if (containerRef.current) {
      const cw = containerRef.current.clientWidth - 80;
      const ch = containerRef.current.clientHeight - 80;
      const sX = cw / template.width;
      const sY = ch / template.height;
      setScale(Math.min(sX, sY, 1));
    }
  }, [template]);

  useEffect(() => {
    if (trRef.current) {
      const nodes = selectedIds.map(id => rectRefs.current[id]).filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, slots]);

  const addSlot = () => {
    // If no slots exist, encourage the "Content Area" by making a large default box
    const isFirstSlot = slots.length === 0;
    
    const newSlot: Slot = {
      id: uuidv4(),
      x: isFirstSlot ? template.width * 0.05 : template.width / 2 - 150,
      y: isFirstSlot ? template.height * 0.2 : template.height / 2 - 150,
      width: isFirstSlot ? template.width * 0.9 : 300,
      height: isFirstSlot ? template.height * 0.6 : 300,
    };
    setSlots([...slots, newSlot]);
    setSelectedIds([newSlot.id]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/templates/${template.id}/slots`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotsData: slots }),
      });
      if (res.ok) {
        alert("Slots saved successfully!");
        router.refresh();
      } else {
        alert("Failed to save slots");
      }
    } catch (e) {
      alert("Error saving slots");
    } finally {
      setIsSaving(false);
    }
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName("bg");
    if (clickedOnEmpty) {
      setSelectedIds([]);
    }
  };

  const handleDragEnd = (e: any, id: string) => {
    const node = e.target;
    setSlots(prev => prev.map(s => s.id === id ? { ...s, x: node.x(), y: node.y() } : s));
  };

  const handleGenerateGrid = () => {
    if (gridRows < 1 || gridCols < 1) return;
    
    // Calculate dimensions with some padding (e.g. 5% padding around the whole grid)
    const paddingX = template.width * 0.05;
    const paddingY = template.height * 0.05;
    
    const availableWidth = template.width - (paddingX * 2);
    const availableHeight = template.height - (paddingY * 2);
    
    const gap = 20; // 20px gap between slots
    
    const slotWidth = (availableWidth - (gap * (gridCols - 1))) / gridCols;
    const slotHeight = (availableHeight - (gap * (gridRows - 1))) / gridRows;
    
    const newSlots: Slot[] = [];
    
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        newSlots.push({
          id: uuidv4(),
          x: paddingX + (c * (slotWidth + gap)),
          y: paddingY + (r * (slotHeight + gap)),
          width: slotWidth,
          height: slotHeight,
        });
      }
    }
    
    setSlots(newSlots);
    setSelectedIds([]);
  };

  const handleSyncSize = () => {
    if (selectedIds.length !== 1) return;
    
    const targetSlot = slots.find(s => s.id === selectedIds[0]);
    if (!targetSlot) return;
    
    setSlots(slots.map(s => {
      if (s.id === targetSlot.id) return s;
      return {
        ...s,
        width: targetSlot.width,
        height: targetSlot.height
      };
    }));
    
    alert("Size synchronized to all slots!");
  };

  return (
    <div className="flex w-full h-[calc(100vh-8rem)] min-h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-72 border-r bg-white flex flex-col">
        {/* Top Fixed Section */}
        <div className="p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-semibold text-lg mb-2">Smart Grid Setup</h3>
          <p className="text-sm text-gray-500 mb-6">
            Hold SHIFT and click to select multiple slots and adjust them together.
          </p>
          
          <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Auto Grid Generator</h4>
            <div className="flex gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rows</label>
                <input 
                  type="number" 
                  min="1" 
                  value={gridRows} 
                  onChange={(e) => setGridRows(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cols</label>
                <input 
                  type="number" 
                  min="1" 
                  value={gridCols} 
                  onChange={(e) => setGridCols(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-1.5 text-sm"
                />
              </div>
            </div>
            <button 
              onClick={handleGenerateGrid}
              className="w-full bg-indigo-600 text-white text-sm font-semibold rounded p-2 hover:bg-indigo-500 transition"
            >
              Generate Grid
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button 
              onClick={addSlot}
              className={`w-full text-white font-semibold rounded p-2 transition text-sm ${slots.length === 0 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {slots.length === 0 ? '+ Add Dynamic Content Area' : '+ Add Fixed Slot'}
            </button>
          </div>

          {selectedIds.length === 1 && (
            <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Selected Slot Size</h4>
              <div className="flex gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                  <input 
                    type="number" 
                    value={Math.round(slots.find(s => s.id === selectedIds[0])?.width || 0)}
                    onChange={(e) => {
                      const val = Math.max(10, Number(e.target.value));
                      setSlots(slots.map(s => s.id === selectedIds[0] ? { ...s, width: val } : s));
                    }}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                  <input 
                    type="number" 
                    value={Math.round(slots.find(s => s.id === selectedIds[0])?.height || 0)}
                    onChange={(e) => {
                      const val = Math.max(10, Number(e.target.value));
                      setSlots(slots.map(s => s.id === selectedIds[0] ? { ...s, height: val } : s));
                    }}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={handleSyncSize}
                className="w-full bg-purple-600 text-white text-sm font-semibold rounded p-2 hover:bg-purple-500 transition"
              >
                Apply Size to All Slots
              </button>
            </div>
          )}
        </div>
          
        {/* Scrollable Slots List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configured Slots ({slots.length})</span>
          </div>
          {slots.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4 italic">No slots added yet.</p>
          )}
            {slots.map((s, index) => (
              <div 
                key={s.id} 
                className={`flex items-center justify-between p-2 rounded border cursor-pointer ${selectedIds.includes(s.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (selectedIds.includes(s.id)) setSelectedIds(selectedIds.filter(id => id !== s.id));
                    else setSelectedIds([...selectedIds, s.id]);
                  } else {
                    setSelectedIds([s.id]);
                  }
                }}
              >
                <span className="text-sm font-medium">Slot {index + 1}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlots(slots.filter(slot => slot.id !== s.id));
                    setSelectedIds(selectedIds.filter(id => id !== s.id));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

        {/* Bottom Fixed Section */}
        <div className="p-5 shrink-0 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-600 text-white font-semibold rounded-lg p-3 hover:bg-green-500 transition shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Smart Grid"}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-gray-200" ref={containerRef}>
        <div className="shadow-2xl bg-white" style={{ width: template.width * scale, height: template.height * scale }}>
          <Stage
            width={template.width * scale}
            height={template.height * scale}
            scale={{ x: scale, y: scale }}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              {bgImage && (
                <KonvaImage image={bgImage} width={template.width} height={template.height} name="bg" />
              )}
              {slots.map((slot) => (
                <Rect
                  key={slot.id}
                  ref={(node) => { rectRefs.current[slot.id] = node; }}
                  x={slot.x}
                  y={slot.y}
                  width={slot.width}
                  height={slot.height}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  draggable
                  onClick={(e) => {
                    e.cancelBubble = true;
                    if (e.evt.shiftKey) {
                      if (selectedIds.includes(slot.id)) {
                        setSelectedIds(selectedIds.filter((id) => id !== slot.id));
                      } else {
                        setSelectedIds([...selectedIds, slot.id]);
                      }
                    } else {
                      setSelectedIds([slot.id]);
                    }
                  }}
                  onTap={(e) => {
                    setSelectedIds([slot.id]);
                  }}
                  onDragEnd={(e) => handleDragEnd(e, slot.id)}
                  onTransformEnd={(e) => {
                    const node = rectRefs.current[slot.id];
                    if (node) {
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);
                      setSlots(prev => prev.map(s => {
                        if (s.id === slot.id) {
                          return {
                            ...s,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(50, node.width() * scaleX),
                            height: Math.max(50, node.height() * scaleY),
                          };
                        }
                        return s;
                      }));
                    }
                  }}
                />
              ))}
              {selectedIds.length > 0 && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 50 || newBox.height < 50) return oldBox;
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
