import { Link } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";
import styles from "./CartPage.module.css";
import { CheckoutForm } from "../components/CheckoutForm/CheckoutForm";

export default function CartPage() {
  const { state, dispatch, cartTotal } = useCartContext();
  
  const handleCheckout = () => {
    const checkoutSection = document.getElementById("checkout-form");
    if (checkoutSection) {
      checkoutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (state.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Start shopping to add items to your cart.</p>
        <Link to="/" className={styles.browseLink}>
          Browse Products
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const clamped = Math.min(Math.max(newQuantity, 1), 99);
    dispatch({
      type: "UPDATE_QUANTITY",
      productId,
      quantity: clamped,
    });
  };

  return (
    <div className={styles.cartPage}>
      <h1>Shopping Cart</h1>

      <div className={styles.itemsList}>
        {state.items.map((item) => (
          <div key={item.productId} className={styles.cartItem}>
            <div className={styles.itemImage}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} />
              ) : (
                <div className={styles.placeholder}>📦</div>
              )}
            </div>

            <div className={styles.itemDetails}>
              <h3>{item.productName}</h3>
              <p className={styles.price}>${item.price.toFixed(2)}</p>
            </div>

            <div className={styles.quantitySelector}>
              <button
                type="button"
                onClick={() =>
                  handleQuantityChange(item.productId, item.quantity - 1)
                }
                disabled={item.quantity === 1}
                aria-label={`Decrease quantity of ${item.productName}`}
                className={styles.quantityButton}
              >
                −
              </button>
              <span className={styles.quantityDisplay}>{item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  handleQuantityChange(item.productId, item.quantity + 1)
                }
                disabled={item.quantity === 99}
                aria-label={`Increase quantity of ${item.productName}`}
                className={styles.quantityButton}
              >
                +
              </button>
            </div>

            <div className={styles.lineTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "REMOVE_FROM_CART",
                  productId: item.productId,
                })
              }
              aria-label={`Remove ${item.productName} from cart`}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className={styles.cartSummary}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>${cartTotal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          className={styles.checkoutButton}
          aria-label="Proceed to checkout"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>

      <section id="checkout-form" className={styles.checkoutSection}>
        <CheckoutForm />
      </section>
    </div>
  );
}