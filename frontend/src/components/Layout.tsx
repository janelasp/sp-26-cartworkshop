import { Link, Outlet } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";
import { CartSidebar } from "./CartSidebar/CartSidebar";
import styles from "./Layout.module.css";

export default function Layout() {
  const { state, dispatch } = useCartContext();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌰</span>
            <h1 className={styles.title}>Buckeye Marketplace</h1>
          </Link>
          <button
            className={styles.cartButton}
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            aria-label="Open shopping cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <CartSidebar />
    </div>
  );
}
