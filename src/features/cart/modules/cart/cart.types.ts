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
