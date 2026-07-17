import { create } from 'zustand';
import { DesignerState, DesignerActions, DocumentDesignerStore, Page, Element } from '../types/document-designer';

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

const MAX_HISTORY_LENGTH = 50;

const initialState: Omit<DesignerState, 'history'> = {
  selectedPageId: null,
  selectedElementId: null,
  zoom: 100,
  pages: [],
  elements: [],
  isDirty: false,
  isSaving: false,
};

export const useDocumentDesignerStore = create<DocumentDesignerStore>((set, get) => ({
  ...initialState,
  history: {
    past: [],
    future: [],
  },

  // Helper to save history
  saveHistory: () => {
    const currentState = get();
    // Only save the data part, not the methods
    const stateToSave = {
      selectedPageId: currentState.selectedPageId,
      selectedElementId: currentState.selectedElementId,
      zoom: currentState.zoom,
      // We use structuredClone if available, otherwise fallback to JSON
      pages: typeof structuredClone !== 'undefined' ? structuredClone(currentState.pages) : JSON.parse(JSON.stringify(currentState.pages)),
      elements: typeof structuredClone !== 'undefined' ? structuredClone(currentState.elements) : JSON.parse(JSON.stringify(currentState.elements)),
      isDirty: currentState.isDirty,
      isSaving: currentState.isSaving,
    };
    
    set((state) => {
      const newPast = [...state.history.past, stateToSave];
      if (newPast.length > MAX_HISTORY_LENGTH) {
        newPast.shift(); // Remove oldest
      }
      return {
        history: {
          past: newPast,
          future: [],
        },
        isDirty: true,
      };
    });
  },

  // --- Page Manager ---
  addPage: () => {
    get().saveHistory();
    const newPageId = generateId();
    set((state) => {
      const newPage: Page = {
        id: newPageId,
        order: state.pages.length,
      };
      return {
        pages: [...state.pages, newPage],
        selectedPageId: newPageId,
      };
    });
  },

  updatePage: (pageId, data) => {
    get().saveHistory();
    set((state) => ({
      pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...data } : p)),
    }));
  },

  deletePage: (pageId) => {
    const state = get();
    if (state.pages.length <= 1) return; // Cannot delete last page

    get().saveHistory();
    set((state) => {
      const pageIndex = state.pages.findIndex(p => p.id === pageId);
      const newPages = state.pages.filter((p) => p.id !== pageId);
      
      // Update orders
      const orderedPages = newPages.map((p, index) => ({ ...p, order: index }));
      
      // Select next or previous page
      let nextSelectedPageId = state.selectedPageId;
      if (state.selectedPageId === pageId) {
        const nextIndex = Math.min(pageIndex, orderedPages.length - 1);
        nextSelectedPageId = orderedPages[nextIndex].id;
      }

      // Check if selected element was on the deleted page
      let nextSelectedElementId = state.selectedElementId;
      if (state.selectedElementId) {
        const selectedElement = state.elements.find(e => e.id === state.selectedElementId);
        if (selectedElement && selectedElement.pageId === pageId) {
          nextSelectedElementId = null;
        }
      }

      return {
        pages: orderedPages,
        elements: state.elements.filter(e => e.pageId !== pageId), // cascade delete elements on page
        selectedPageId: nextSelectedPageId,
        selectedElementId: nextSelectedElementId,
      };
    });
  },

  duplicatePage: (pageId) => {
    get().saveHistory();
    set((state) => {
      const pageToDuplicate = state.pages.find((p) => p.id === pageId);
      if (!pageToDuplicate) return state;

      const newPageId = generateId();
      const newPage: Page = {
        ...pageToDuplicate,
        id: newPageId,
        order: state.pages.length,
      };

      const elementsToDuplicate = state.elements.filter((e) => e.pageId === pageId);
      const newElements = elementsToDuplicate.map((e) => ({
        ...e,
        id: generateId(),
        pageId: newPageId,
      }));

      return {
        pages: [...state.pages, newPage],
        elements: [...state.elements, ...newElements],
        selectedPageId: newPageId,
      };
    });
  },

  reorderPage: (fromIndex, toIndex) => {
    get().saveHistory();
    set((state) => {
      const newPages = [...state.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      
      return {
        pages: newPages.map((p, i) => ({ ...p, order: i }))
      };
    });
  },

  selectPage: (pageId) => set({ selectedPageId: pageId }),

  // --- Element Manager ---
  addElement: (type, initialData = {}) => {
    const state = get();
    if (!state.selectedPageId) return; // Need a page to add to
    
    get().saveHistory();
    const newElement: Element = {
      id: generateId(),
      type,
      pageId: state.selectedPageId,
      x: 0,
      y: 0,
      width: 100, // Default width
      height: 100, // Default height
      ...initialData,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
    }));
  },

  updateElement: (elementId, data) => {
    get().saveHistory();
    set((state) => ({
      elements: state.elements.map((e) => (e.id === elementId ? { ...e, ...data } : e)),
    }));
  },

  deleteElement: (elementId) => {
    get().saveHistory();
    set((state) => ({
      elements: state.elements.filter((e) => e.id !== elementId),
      selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
    }));
  },

  duplicateElement: (elementId) => {
    get().saveHistory();
    set((state) => {
      const elementToDuplicate = state.elements.find((e) => e.id === elementId);
      if (!elementToDuplicate) return state;

      const newElement: Element = {
        ...elementToDuplicate,
        id: generateId(),
        x: elementToDuplicate.x + 20, // Offset a bit visually
        y: elementToDuplicate.y + 20,
      };

      return {
        elements: [...state.elements, newElement],
        selectedElementId: newElement.id,
      };
    });
  },

  moveElement: (elementId, x, y) => {
    get().saveHistory();
    set((state) => ({
      elements: state.elements.map((e) => (e.id === elementId ? { ...e, x, y } : e)),
    }));
  },

  resizeElement: (elementId, width, height) => {
    get().saveHistory();
    set((state) => ({
      elements: state.elements.map((e) => (e.id === elementId ? { ...e, width, height } : e)),
    }));
  },

  selectElement: (elementId) => set({ selectedElementId: elementId }),

  // --- General & History ---
  setZoom: (zoom) => set({ zoom }),
  setIsSaving: (isSaving) => set({ isSaving }),
  markSaved: () => set({ isDirty: false }),

  undo: () => {
    set((state) => {
      const { past, future } = state.history;
      if (past.length === 0) return state;

      const previousState = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      
      const currentState = {
        selectedPageId: state.selectedPageId,
        selectedElementId: state.selectedElementId,
        zoom: state.zoom,
        pages: state.pages,
        elements: state.elements,
        isDirty: state.isDirty,
        isSaving: state.isSaving,
      };

      return {
        ...previousState,
        history: {
          past: newPast,
          future: [currentState, ...future],
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      const { past, future } = state.history;
      if (future.length === 0) return state;

      const nextState = future[0];
      const newFuture = future.slice(1);

      const currentState = {
        selectedPageId: state.selectedPageId,
        selectedElementId: state.selectedElementId,
        zoom: state.zoom,
        pages: state.pages,
        elements: state.elements,
        isDirty: state.isDirty,
        isSaving: state.isSaving,
      };

      return {
        ...nextState,
        history: {
          past: [...past, currentState],
          future: newFuture,
        },
      };
    });
  },
}));
