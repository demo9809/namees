import { create } from 'zustand';
import { CanvasElement } from '@/components/editor/CanvasStage';

interface EditorState {
  // Document State
  template: any | null;
  pages: CanvasElement[][];
  currentPageIndex: number;
  
  // Viewport State
  scale: number;
  baseScale: number;
  zoomLevel: number;
  
  // Selection State
  selectedId: string | null;
  activePriceTagId: string | null;
  
  // Library Data
  products: any[];
  categories: any[];
  priceTags: any[];
  
  // Actions
  setTemplate: (template: any) => void;
  setPages: (pages: CanvasElement[][]) => void;
  setElements: (elements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => void;
  setCurrentPageIndex: (index: number) => void;
  setScale: (scale: number) => void;
  setBaseScale: (scale: number) => void;
  setZoomLevel: (level: number) => void;
  setSelectedId: (id: string | null) => void;
  setActivePriceTagId: (id: string | null) => void;
  
  setProducts: (products: any[]) => void;
  setCategories: (categories: any[]) => void;
  setPriceTags: (priceTags: any[]) => void;
  
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  pages: [[]],
  currentPageIndex: 0,
  scale: 1,
  baseScale: 1,
  zoomLevel: 1,
  selectedId: null,
  activePriceTagId: null,
  products: [],
  categories: [],
  priceTags: [],

  setTemplate: (template) => set({ template }),
  
  setPages: (pages) => set({ pages }),
  
  setElements: (elementsOrUpdater) => set((state) => {
    const newPages = [...state.pages];
    const currentElements = newPages[state.currentPageIndex] || [];
    newPages[state.currentPageIndex] = typeof elementsOrUpdater === 'function' ? elementsOrUpdater(currentElements) : elementsOrUpdater;
    return { pages: newPages };
  }),
  
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),
  
  setScale: (scale) => set({ scale }),
  setBaseScale: (baseScale) => set({ baseScale }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel, scale: get().baseScale * zoomLevel }),
  
  setSelectedId: (id) => set({ selectedId: id }),
  
  setActivePriceTagId: (id) => set({ activePriceTagId: id }),
  
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setPriceTags: (priceTags) => set({ priceTags }),
  
  updateElement: (id, updates) => set((state) => {
    const newPages = [...state.pages];
    const elements = newPages[state.currentPageIndex];
    newPages[state.currentPageIndex] = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    return { pages: newPages };
  }),
  
  deleteElement: (id) => set((state) => {
    const newPages = [...state.pages];
    newPages[state.currentPageIndex] = newPages[state.currentPageIndex].filter(el => el.id !== id);
    return { pages: newPages, selectedId: state.selectedId === id ? null : state.selectedId };
  }),
}));
