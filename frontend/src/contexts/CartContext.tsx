import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { cartReducer, initialCartState } from "../reducers/cartReducer";
import type { CartState, CartAction } from "../types/cart";

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  cartItemCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const cartItemCount = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ state, dispatch, cartItemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextType {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error(
      "useCartContext must be used within a CartProvider. Wrap your component tree with <CartProvider>."
    );
  }
  return context;
}

