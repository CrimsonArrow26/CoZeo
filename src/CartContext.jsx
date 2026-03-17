import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import {
  fetchUserCart,
  addCartItem as addCartItemDB,
  updateCartItem as updateCartItemDB,
  removeCartItem as removeCartItemDB,
  clearUserCart as clearUserCartDB,
  mergeGuestCart,
} from './api/cart';

const CartContext = createContext();

// Local storage key for guest cart
const GUEST_CART_KEY = 'cozeo_guest_cart';

export const products = [
  {
    id: 1, slug: 'shadow-drip', name: 'Shadow Drip', price: 79,
    tag: 'Sale', image: '/images/1.jpeg',
    description: 'A sleek, minimalist hoodie with dark tones and subtle reflective accents for an effortless street vibe.',
    images: ['/images/1.jpeg', '/images/1-1.avif', '/images/1-2.avif']
  },
  {
    id: 2, slug: 'urban-phantom', name: 'Urban Phantom', price: 99,
    tag: 'Drop', image: '/images/2-3.avif',
    description: 'An oversized hoodie with graphics and a stealthy aesthetic inspired by city nights.',
    images: ['/images/2-3.avif', '/images/2-1.avif', '/images/2-2.avif']
  },
  {
    id: 3, slug: 'neon-rebellion', name: 'Neon Rebellion', price: 89,
    tag: 'New', image: '/images/3-1.avif',
    description: 'A statement piece with vibrant neon details and rebellious street art influences for a standout look.',
    images: ['/images/3-1.avif', '/images/3-2.avif', '/images/3-3.avif']
  },
];

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbCartItems, setDbCartItems] = useState([]); // Track DB cart items separately

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user?.id]);

  // Load cart from localStorage (guest) or database (logged in)
  const loadCart = useCallback(async () => {
    if (user?.id) {
      // User is logged in - fetch from database
      setIsSyncing(true);
      try {
        const items = await fetchUserCart();
        setDbCartItems(items);
        // Convert DB items to local format
        const localFormatItems = items.map(item => ({
          id: item.product?.id || item.product_id,
          cartItemId: item.id, // Track the DB cart item ID
          name: item.product?.name,
          price: item.product?.discount_price || item.product?.price,
          originalPrice: item.product?.price,
          size: item.size,
          color: item.color,
          qty: item.quantity,
          images: item.product?.images || [],
          maxStock: item.product?.stock || 10,
          slug: item.product?.slug,
        })).filter(item => item.id && item.name); // Only include items with valid product data
        setCartItems(localFormatItems);
      } catch (err) {
        // Silently fail, cart will be empty
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Guest user - load from localStorage
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        if (saved) {
          setCartItems(JSON.parse(saved));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [user?.id]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user?.id && cartItems.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  // Merge guest cart with user cart on login
  useEffect(() => {
    const mergeOnLogin = async () => {
      if (user?.id) {
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        if (guestCart) {
          try {
            const items = JSON.parse(guestCart);
            if (items.length > 0) {
              // Merge guest items with user cart
              const mergeableItems = items.map(item => ({
                productId: String(item.id),
                size: item.size,
                color: item.color,
                quantity: item.qty,
              }));
              await mergeGuestCart(mergeableItems);
              // Clear guest cart after merge
              localStorage.removeItem(GUEST_CART_KEY);
              // Reload cart to show merged items
              await loadCart();
            }
          } catch {
            // Ignore merge errors
          }
        }
      }
    };
    mergeOnLogin();
  }, [user?.id, loadCart]);

  // Add to cart
  const addToCart = async (product, size = 'M', qty = 1, color = null) => {
    if (user?.id) {
      // Logged in user - add to database
      setIsSyncing(true);
      try {
        // Check if item already exists in cart
        const existingItem = dbCartItems.find(
          item => item.product_id === product.id && item.size === size && item.color === color
        );
        
        if (existingItem) {
          // Update quantity
          await updateCartItemDB(existingItem.id, existingItem.quantity + qty);
        } else {
          // Add new item
          await addCartItemDB(String(product.id), size, qty, color);
        }
        
        // Reload cart from database
        await loadCart();
      } catch (err) {
        // Silently fail - cart operation is non-critical
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Guest user - add to local state
      setCartItems(prev => {
        const existing = prev.find(i => i.id === product.id && i.size === size);
        if (existing) {
          return prev.map(i => 
            i.id === product.id && i.size === size 
              ? { ...i, qty: Math.min(i.qty + qty, 10) } 
              : i
          );
        }
        return [...prev, { 
          ...product, 
          size, 
          qty,
          color,
          originalPrice: product.price,
          maxStock: product.stock || 10
        }];
      });
    }
    setCartOpen(true);
  };

  // Remove from cart
  const removeFromCart = async (id, size) => {
    if (user?.id) {
      // Logged in user - remove from database
      const cartItem = dbCartItems.find(
        item => item.product?.id === id && item.size === size
      );
      if (cartItem) {
        setIsSyncing(true);
        try {
          await removeCartItemDB(cartItem.id);
          await loadCart();
        } catch {
          // Silently fail
        } finally {
          setIsSyncing(false);
        }
      }
    } else {
      // Guest user - remove from local state
      setCartItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
    }
  };

  // Update quantity
  const updateQty = async (id, size, qty) => {
    if (user?.id) {
      // Logged in user - update in database
      const cartItem = dbCartItems.find(
        item => item.product?.id === id && item.size === size
      );
      if (cartItem) {
        setIsSyncing(true);
        try {
          if (qty < 1) {
            // Remove item when quantity is 0
            await removeCartItemDB(cartItem.id);
          } else {
            await updateCartItemDB(cartItem.id, qty);
          }
          // Reload cart from database after update
          await loadCart();
        } catch {
          // Silently fail
        } finally {
          setIsSyncing(false);
        }
      }
    } else {
      // Guest user - update local state
      if (qty < 1) {
        // Remove item when quantity is 0
        setCartItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
      } else {
        setCartItems(prev => prev.map(i => 
          i.id === id && i.size === size ? { ...i, qty: Math.min(qty, 10) } : i
        ));
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user?.id) {
      setIsSyncing(true);
      try {
        await clearUserCartDB();
        setCartItems([]);
        setDbCartItems([]);
      } catch {
        // Silently fail
      } finally {
        setIsSyncing(false);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + (i.price || i.originalPrice || 0) * i.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartOpen, 
      setCartOpen, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart,
      totalItems, 
      subtotal,
      isSyncing 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
