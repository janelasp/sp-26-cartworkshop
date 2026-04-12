import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCartContext } from "./CartContext";

function CartProbe() {
  const { cartItemCount, cartTotal, dispatch } = useCartContext();

  return (
    <div>
      <div aria-label="cart-item-count">{cartItemCount}</div>
      <div aria-label="cart-total">{cartTotal.toFixed(2)}</div>

      <button
        type="button"
        aria-label="add-widget"
        onClick={() =>
          dispatch({
            type: "ADD_TO_CART",
            id: 10,
            name: "Widget",
            price: 2.5,
          })
        }
      >
        Add Widget
      </button>

      <button
        type="button"
        aria-label="increase-widget"
        onClick={() =>
          dispatch({
            type: "UPDATE_QUANTITY",
            productId: 10,
            quantity: cartItemCount + 1,
          })
        }
      >
        Increase
      </button>

      <button
        type="button"
        aria-label="clear-cart"
        onClick={() => dispatch({ type: "CLEAR_CART" })}
      >
        Clear
      </button>
    </div>
  );
}

describe("CartContext", () => {
  it("throws a helpful error when used outside CartProvider", () => {
    function UsesCartContext() {
      useCartContext();
      return <div />;
    }

    expect(() => render(<UsesCartContext />)).toThrow(
      /useCartContext must be used within a CartProvider/i
    );
  });

  it("computes cartItemCount and cartTotal from provider state", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByLabelText("cart-item-count")).toHaveTextContent("0");
    expect(screen.getByLabelText("cart-total")).toHaveTextContent("0.00");

    await user.click(screen.getByRole("button", { name: "add-widget" }));

    expect(screen.getByLabelText("cart-item-count")).toHaveTextContent("1");
    expect(screen.getByLabelText("cart-total")).toHaveTextContent("2.50");

    await user.click(screen.getByRole("button", { name: "add-widget" }));

    expect(screen.getByLabelText("cart-item-count")).toHaveTextContent("2");
    expect(screen.getByLabelText("cart-total")).toHaveTextContent("5.00");

    await user.click(screen.getByRole("button", { name: "clear-cart" }));

    expect(screen.getByLabelText("cart-item-count")).toHaveTextContent("0");
    expect(screen.getByLabelText("cart-total")).toHaveTextContent("0.00");
  });
});
