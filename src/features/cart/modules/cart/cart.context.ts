import { createContext } from 'react';
import type { CartState } from './cart.types.ts';

export const CartContext = createContext<CartState | null>(null);
