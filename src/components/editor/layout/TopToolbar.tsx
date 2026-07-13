import React from "react";
import { ZoomIn, ZoomOut, Maximize, Wand2, Download, Save } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";

interface TopToolbarProps {
  onAutoFillClick: () => void;
  onExportClick: () => void;
  onSaveClick: () => void;
}

export function TopToolbar({ onAutoFillClick, onExportClick, onSaveClick }: TopToolbarProps) {
  const { template, zoomLevel, setZoomLevel } = useEditorStore();

  if (!template) return null;

  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <span className="font-semibold text-gray-900 truncate max-w-[200px]">
          {template.name}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md font-medium tracking-wide uppercase">
          Draft
        </span>
      </div>
      
      <div className="flex items-center gap-1 bg-gray-50/80 backdrop-blur p-1 rounded-lg border border-gray-200/60 shadow-sm flex-none">
        <button 
          onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))} 
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-[11px] font-semibold w-12 text-center text-gray-700 select-none">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button 
          onClick={() => setZoomLevel(zoomLevel + 0.1)} 
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <button 
          onClick={() => setZoomLevel(1)} 
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all active:scale-95"
          title="Fit to Screen"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          onClick={onAutoFillClick}
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-bold text-white hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" /> Auto-Fill
        </button>
        <button
          onClick={onSaveClick}
          className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <Save className="h-4 w-4 text-gray-500" /> Save
        </button>
        <button
          onClick={onExportClick}
          className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>
    </div>
  );
}
