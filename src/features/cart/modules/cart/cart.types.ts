export interface CartProduct {
  id: number;
  title: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export interface CartSnapshot {
  items: CartItem[];
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  storageError: string | null;
  addItem: (product: CartProduct) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}
