import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { getOrderById } from "../api/orders";
import styles from "./OrderConfirmationPage.module.css";

export default function OrderConfirmationPage() {
  const { state: authState, isAuthenticated } = useAuthContext();
  const { orderId } = useParams<{ orderId: string }>();

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order Confirmation</h1>
        <div className={styles.card}>
          Please <Link to="/login">log in</Link> to view your confirmation.
        </div>
      </div>
    );
  }

  const username = authState.me?.username ?? "";
  if (!username || !orderId) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order Confirmation</h1>
        <div className={styles.card}>Missing order information.</div>
      </div>
    );
  }

  const order = getOrderById(username, orderId);

  if (!order) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order Confirmation</h1>
        <div className={styles.card}>We couldn’t find that order.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order Confirmation</h1>
      <div className={styles.card} data-testid="order-confirmation">
        <div className={styles.status} role="status">
          ✓ Order placed successfully! Order #{order.id.slice(0, 8)}.
        </div>
        <div className={styles.meta}>
          Placed {new Date(order.createdAt).toLocaleString("en-US")} • Total ${order.total.toFixed(2)}
        </div>
        <div className={styles.actions}>
          <Link to="/orders" aria-label="Go to order history">
            Go to order history
          </Link>
          <Link to="/" aria-label="Continue shopping">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
