import { create } from 'zustand';
import { Person } from '@/types';

interface AppState {
  // Selected person
  selectedPersonId: number | null;
  setSelectedPersonId: (id: number | null) => void;
  
  // Modal states
  isPersonFormOpen: boolean;
  editingPerson: Person | null;
  openPersonForm: (person?: Person) => void;
  closePersonForm: () => void;
  
  isWifeFormOpen: boolean;
  wifeFormPersonId: number | null;
  openWifeForm: (personId: number) => void;
  closeWifeForm: () => void;
  
  isSourceFormOpen: boolean;
  sourceFormPersonId: number | null;
  openSourceForm: (personId: number) => void;
  closeSourceForm: () => void;
  
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Data refresh triggers
  refreshKey: number;
  triggerRefresh: () => void;
  
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useAppStore = create<AppState>((set) => ({
  // Selected person
  selectedPersonId: null,
  setSelectedPersonId: (id) => set({ selectedPersonId: id }),
  
  // Person form
  isPersonFormOpen: false,
  editingPerson: null,
  openPersonForm: (person) => set({ 
    isPersonFormOpen: true, 
    editingPerson: person || null 
  }),
  closePersonForm: () => set({ 
    isPersonFormOpen: false, 
    editingPerson: null 
  }),
  
  // Wife form
  isWifeFormOpen: false,
  wifeFormPersonId: null,
  openWifeForm: (personId) => set({ 
    isWifeFormOpen: true, 
    wifeFormPersonId: personId 
  }),
  closeWifeForm: () => set({ 
    isWifeFormOpen: false, 
    wifeFormPersonId: null 
  }),
  
  // Source form
  isSourceFormOpen: false,
  sourceFormPersonId: null,
  openSourceForm: (personId) => set({ 
    isSourceFormOpen: true, 
    sourceFormPersonId: personId 
  }),
  closeSourceForm: () => set({ 
    isSourceFormOpen: false, 
    sourceFormPersonId: null 
  }),
  
  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto remove
    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
  
  // Refresh
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
