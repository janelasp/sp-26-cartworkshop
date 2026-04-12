export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  username: string;
  createdAt: string; // ISO string
  shipping: ShippingAddress;
  items: OrderItem[];
  total: number;
}
