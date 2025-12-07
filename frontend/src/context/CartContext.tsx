import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItemType = 'product' | 'workshop' | 'course';

export interface CartItem {
    id: number; // ID from database
    uniqueId: string; // generated unique ID (e.g., "product-1", "workshop-5")
    type: CartItemType;
    title: string;
    price: number;
    image?: string;
    quantity: number;
    maxQuantity?: number; // For stock limits
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (item: Omit<CartItem, 'uniqueId' | 'quantity'> & { quantity?: number }) => void;
    removeFromCart: (uniqueId: string) => void;
    updateQuantity: (uniqueId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('tmm_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('tmm_cart', JSON.stringify(items));
    }, [items]);

    const toggleCart = () => setIsOpen(prev => !prev);
    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const addToCart = (newItem: Omit<CartItem, 'uniqueId' | 'quantity'> & { quantity?: number }) => {
        setItems(prev => {
            const uniqueId = `${newItem.type}-${newItem.id}`;
            const existing = prev.find(item => item.uniqueId === uniqueId);
            const quantityToAdd = newItem.quantity || 1;

            if (existing) {
                return prev.map(item =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity + quantityToAdd }
                        : item
                );
            }

            return [...prev, { ...newItem, uniqueId, quantity: quantityToAdd }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (uniqueId: string) => {
        setItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(uniqueId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.uniqueId === uniqueId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            isOpen,
            toggleCart,
            openCart,
            closeCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
