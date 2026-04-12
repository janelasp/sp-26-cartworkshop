import { describe, expect, it } from "vitest";
import { cartReducer, initialCartState } from "./cartReducer";

describe("cartReducer (pure function)", () => {
  it("adds a new item on ADD_TO_CART when item is not present", () => {
    const next = cartReducer(initialCartState, {
      type: "ADD_TO_CART",
      id: 1,
      name: "Widget",
      price: 9.99,
      imageUrl: "https://example.com/widget.png",
    });

    expect(next).toEqual({
      ...initialCartState,
      items: [
        {
          productId: 1,
          productName: "Widget",
          price: 9.99,
          imageUrl: "https://example.com/widget.png",
          quantity: 1,
        },
      ],
    });
  });

  it("increments quantity on ADD_TO_CART when item already exists", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_TO_CART",
      id: 1,
      name: "Widget",
      price: 9.99,
    });

    const next = cartReducer(state, {
      type: "ADD_TO_CART",
      id: 1,
      name: "Widget",
      price: 9.99,
    });

    expect(next.items).toHaveLength(1);
    expect(next.items[0]).toMatchObject({
      productId: 1,
      productName: "Widget",
      price: 9.99,
      quantity: 2,
    });
  });

  it("removes item when UPDATE_QUANTITY is set below 1", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_TO_CART",
      id: 1,
      name: "Widget",
      price: 9.99,
    });

    const next = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      productId: 1,
      quantity: 0,
    });

    expect(next.items).toEqual([]);
  });
});
