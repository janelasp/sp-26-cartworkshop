import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { getOrders } from "../api/orders";
import styles from "./OrderHistoryPage.module.css";

export default function OrderHistoryPage() {
  const { state: authState, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order History</h1>
        <p className={styles.empty}>
          Please <Link to="/login">log in</Link> to view your orders.
        </p>
      </div>
    );
  }

  const username = authState.me?.username ?? "";
  if (!username) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Order History</h1>
        <p className={styles.error}>Error: Missing username</p>
      </div>
    );
  }

  const orders = getOrders(username);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order History</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>You don’t have any orders yet.</p>
          <Link to="/">Browse products</Link>
        </div>
      ) : (
        <div className={styles.orderList} data-testid="order-history-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className={styles.orderCard}
              data-testid="order-history-item"
            >
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderId}>Order #{order.id.slice(0, 8)}</div>
                  <div className={styles.meta}>
                    Placed {new Date(order.createdAt).toLocaleString("en-US")}
                  </div>
                </div>
                <div className={styles.meta}>{order.shipping.fullName}</div>
              </div>

              <ul className={styles.items}>
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.productId}`}>
                    {item.productName} × {item.quantity}
                  </li>
                ))}
              </ul>

              <div className={styles.total}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
