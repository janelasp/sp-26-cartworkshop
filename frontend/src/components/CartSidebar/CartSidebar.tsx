import { Link } from "react-router-dom";
import { useCartContext } from "../../contexts/CartContext";
import styles from "./CartSidebar.module.css";

export function CartSidebar() {
  const { state, dispatch } = useCartContext();
  if (!state.isOpen) return null;

  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <div
        className={styles.overlay}
        onClick={() => dispatch({ type: "TOGGLE_CART" })}
        aria-label="Close cart"
      />
      <aside className={styles.sidebar} aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Your Cart</h2>
          <button
            className={styles.closeButton}
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className={styles.items}>
          {state.items.length === 0 ? (
            <p className={styles.emptyMessage}>Your cart is empty</p>
          ) : (
            state.items.map((item) => (
              <div key={item.productId} className={styles.cartItem}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className={styles.itemImage}
                  />
                ) : (
                  <div className={styles.itemPlaceholder}>📦</div>
                )}

                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.productName}</p>
                  <p className={styles.itemPrice}>
                    ${item.price.toFixed(2)}
                  </p>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                            productId: item.productId,
                            quantity: item.quantity - 1,
                        })
                      }
                      aria-label={`Decrease quantity of ${item.productName}`}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                        
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          
                        })
                      }
                      aria-label={`Increase quantity of ${item.productName}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_FROM_CART",
                       productId: item.productId,
                      })
                    }
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {state.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link
            
              to="/cart"
              className={styles.checkoutButton}
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
              aria-label="Proceed to checkout"
            >
              Checkout
            </Link>
            <button
              className={styles.clearButton}
              onClick={() => dispatch({ type: "CLEAR_CART" })}
              aria-label="Clear cart"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
