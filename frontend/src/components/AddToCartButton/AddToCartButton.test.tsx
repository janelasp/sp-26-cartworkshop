import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { CartProvider, useCartContext } from "../../contexts/CartContext";
import { AddToCartButton } from "./AddToCartButton";

function CartCount() {
  const { cartItemCount } = useCartContext();
  return <div aria-label="cart-count">{cartItemCount}</div>;
}

describe("AddToCartButton", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds the product, shows 'Added!' briefly, then resets", async () => {
    vi.useFakeTimers();

    render(
      <CartProvider>
        <AddToCartButton
          product={{
            id: 42,
            name: "Widget",
            price: 3.25,
            imageUrl: "https://example.com/widget.png",
          }}
        />
        <CartCount />
      </CartProvider>
    );

    expect(screen.getByLabelText("cart-count")).toHaveTextContent("0");

    const button = screen.getByRole("button", { name: "Add Widget to cart" });
    expect(button).toHaveTextContent("Add to Cart");
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(screen.getByLabelText("cart-count")).toHaveTextContent("1");
    expect(button).toHaveTextContent("Added!");
    expect(button).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(button).toHaveTextContent("Add to Cart");
    expect(button).not.toBeDisabled();
  });
});
