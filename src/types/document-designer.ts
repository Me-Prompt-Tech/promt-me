export interface Page {
  id: string;
  order: number;
}

export interface Element {
  id: string;
  type: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: any;
  style?: Record<string, any>;
  config?: Record<string, any>;
}

export interface HistoryState {
  past: Omit<DesignerState, "history">[];
  future: Omit<DesignerState, "history">[];
}

export interface DesignerState {
  selectedPageId: string | null;
  selectedElementId: string | null;
  zoom: number;
  pages: Page[];
  elements: Element[];
  history: HistoryState;
  isDirty: boolean;
  isSaving: boolean;
}

export interface DesignerActions {
  // Page Manager
  addPage: () => void;
  updatePage: (pageId: string, data: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  reorderPage: (fromIndex: number, toIndex: number) => void;
  selectPage: (pageId: string | null) => void;

  // Element Manager
  addElement: (type: string, initialData?: Partial<Element>) => void;
  updateElement: (elementId: string, data: Partial<Element>) => void;
  deleteElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  moveElement: (elementId: string, x: number, y: number) => void;
  resizeElement: (elementId: string, width: number, height: number) => void;
  selectElement: (elementId: string | null) => void;

  // General state
  setZoom: (zoom: number) => void;
  setIsSaving: (isSaving: boolean) => void;
  markSaved: () => void; // Resets isDirty

  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

export type DocumentDesignerStore = DesignerState & DesignerActions;
