'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserCart, saveUserCart } from '@/lib/firestore';
import toast from 'react-hot-toast';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from Firestore when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { cart } = await getUserCart(user.uid);
      setCartItems(cart || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    setLoading(false);
  };

  // Save cart to Firestore
  const syncCart = useCallback(async (items) => {
    if (user) {
      await saveUserCart(user.uid, items);
    }
  }, [user]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return false;
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      let newItems;

      if (existingIndex >= 0) {
        newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        newItems = [...prev, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
          stock: product.stock,
        }];
      }

      syncCart(newItems);
      return newItems;
    });

    toast.success('Added to cart!');
    return true;
  }, [user, syncCart]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.productId !== productId);
      syncCart(newItems);
      return newItems;
    });
    toast.success('Removed from cart');
  }, [syncCart]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;

    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      syncCart(newItems);
      return newItems;
    });
  }, [syncCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (user) {
      syncCart([]);
    }
  }, [user, syncCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
