export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | {
      type: "ADD_TO_CART";
      id: number;
      name: string;
      price: number;
      imageUrl?: string;
    }
  | {
      type: "REMOVE_FROM_CART";
      productId: number;
    }
  | {
      type: "UPDATE_QUANTITY";
      productId: number;
      quantity: number;
    }
  | {
      type: "CLEAR_CART";
    }
  | {
      type: "TOGGLE_CART";
    };