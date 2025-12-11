import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar carrinho do localStorage apenas uma vez
  useEffect(() => {
    const saved = localStorage.getItem('vipo-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error('Erro ao carregar carrinho:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar carrinho no localStorage quando items mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vipo-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      // Verifica se já existe o mesmo produto com a mesma variante
      // Compara por productId E variantId para garantir que é o mesmo item
      const existingIndex = prev.findIndex(item => {
        // Comparação estrita: mesmo produto E mesma variante
        return item.productId === newItem.productId && 
               item.variantId === newItem.variantId;
      });
      
      if (existingIndex !== -1) {
        // Se existe, incrementa a quantidade do item existente
        const updated = prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
        return updated;
      }
      
      // Se não existe, adiciona novo item
      // Garante que o ID seja consistente
      const consistentId = `${newItem.productId}-${newItem.variantId}`;
      return [...prev, { ...newItem, id: consistentId }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => ({
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }), [items, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}

