import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { CartItem, Corner, Location } from "@shared/schema";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  facilityId: string | null;
  facilityName: string | null;
  facilityLocation: Location | null;
  cornerId: string | null;
  cornerType: string | null;
  
  addItem: (item: Omit<CartItem, "id" | "quantity">, corner: Corner, facility: { id: string; name: string; location: Location }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [facilityLocation, setFacilityLocation] = useState<Location | null>(null);
  const [cornerId, setCornerId] = useState<string | null>(null);
  const [cornerType, setCornerType] = useState<string | null>(null);

  const addItem = useCallback((
    item: Omit<CartItem, "id" | "quantity">,
    corner: Corner,
    facility: { id: string; name: string; location: Location }
  ) => {
    if (facilityId && facilityId !== facility.id) {
      setItems([]);
    }

    setFacilityId(facility.id);
    setFacilityName(facility.name);
    setFacilityLocation(facility.location);
    setCornerId(corner.id);
    setCornerType(corner.type);

    setItems((prev) => {
      const existingItem = prev.find((i) => i.menuId === item.menuId);
      if (existingItem) {
        return prev.map((i) =>
          i.menuId === item.menuId
            ? { ...i, quantity: Math.min(5, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { ...item, id: crypto.randomUUID(), quantity: 1 }];
    });

    setIsOpen(true);
  }, [facilityId]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== itemId);
      if (newItems.length === 0) {
        setFacilityId(null);
        setFacilityName(null);
        setFacilityLocation(null);
        setCornerId(null);
        setCornerType(null);
      }
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: Math.min(5, quantity) } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setFacilityId(null);
    setFacilityName(null);
    setFacilityLocation(null);
    setCornerId(null);
    setCornerType(null);
    setIsOpen(false);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        facilityId,
        facilityName,
        facilityLocation,
        cornerId,
        cornerType,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
