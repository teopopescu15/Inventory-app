import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '../types/order';
import type { Product } from '../types/product';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'warehouse_cart';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Use lazy initialization to load cart from localStorage immediately
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Add item to cart or update quantity if already exists
  const addItem = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      if (existingItem) {
        // Update quantity, but don't exceed available stock
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.count
        );
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product.id!,
          productTitle: product.title,
          productImage: product.image,
          unitPrice: product.price,
          quantity: Math.min(quantity, product.count),
          maxQuantity: product.count,
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Update quantity of existing item
  const updateQuantity = (productId: number, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return prevItems.filter((item) => item.productId !== productId);
      }

      return prevItems.map((item) => {
        if (item.productId === productId) {
          // Don't exceed max quantity
          const newQuantity = Math.min(quantity, item.maxQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // Remove item from cart
  const removeItem = (productId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  // Clear all items from cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate total number of items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
