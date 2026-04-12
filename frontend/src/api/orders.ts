import type { CartItem } from "../types/cart";
import type { Order, OrderItem, ShippingAddress } from "../types/order";

const ORDERS_STORAGE_KEY_PREFIX = "buckeye.orders.";

function storageKey(username: string): string {
  return `${ORDERS_STORAGE_KEY_PREFIX}${username.toLowerCase()}`;
}

function safeParseOrders(raw: string | null): Order[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

export async function fetchOrders(username: string): Promise<Order[]> {
  return getOrders(username);
}

export function getOrders(username: string): Order[] {
  const orders = safeParseOrders(localStorage.getItem(storageKey(username)));
  // newest first
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(username: string, orderId: string): Order | null {
  const orders = safeParseOrders(localStorage.getItem(storageKey(username)));
  return orders.find((o) => o.id === orderId) ?? null;
}

interface PlaceOrderInput {
  username: string;
  shipping: ShippingAddress;
  items: CartItem[];
  total: number;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  if (!input.username) {
    throw new Error("Username is required to place an order");
  }

  if (input.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderItems: OrderItem[] = input.items.map((i) => ({
    productId: i.productId,
    productName: i.productName,
    price: i.price,
    quantity: i.quantity,
  }));

  const order: Order = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    username: input.username,
    createdAt: new Date().toISOString(),
    shipping: input.shipping,
    items: orderItems,
    total: input.total,
  };

  const existing = safeParseOrders(localStorage.getItem(storageKey(input.username)));
  const next = [order, ...existing];
  localStorage.setItem(storageKey(input.username), JSON.stringify(next));

  return order;
}
