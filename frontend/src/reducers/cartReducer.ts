import type { CartAction, CartState } from "../types/cart";

export const initialCartState: CartState = {
  items: [],
  isOpen: false,
};

function assertNever(value: never): never {
  throw new Error(`Unhandled cart action: ${JSON.stringify(value)}`);
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.items.find(
        (item) => item.productId === action.id
      );

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: action.id,
            productName: action.name,
            price: action.price,
            imageUrl: action.imageUrl,
            quantity: 1,
          },
        ],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.productId !== action.productId
        ),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity < 1) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.productId !== action.productId
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };
  }

  return assertNever(action);
}
