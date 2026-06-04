import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cafeteria_id: string;
  cafeteria_name: string;
  image_url?: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        // Enforce Single Cafeteria Rule: If cart has items from a different cafe, clear it first
        const isDifferentCafe = state.items.length > 0 && state.items[0].cafeteria_id !== item.cafeteria_id;
        
        if (isDifferentCafe) {
          // Replace the cart entirely with the new item from the new cafeteria
          return { items: [{ ...item, quantity: 1 }] };
        }

        // Check if item already exists in the cart
        const existingItem = state.items.find((i) => i.id === item.id);
        
        if (existingItem) {
          // Increase quantity
          return {
            items: state.items.map((i) => 
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        }

        // Add new item to cart
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'smart-dining-cart', // Key for localStorage
    }
  )
);