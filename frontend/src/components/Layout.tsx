import { Link, Outlet } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";
import { useAuthContext } from "../contexts/AuthContext";
import { CartSidebar } from "./CartSidebar/CartSidebar";
import styles from "./Layout.module.css";

export default function Layout() {
  const { state, dispatch } = useCartContext();
  const { state: authState, isAuthenticated, logout } = useAuthContext();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌰</span>
            <h1 className={styles.title}>Buckeye Marketplace</h1>
          </Link>
          <div className={styles.headerActions}>
            <div className={styles.authArea} aria-label="Authentication">
              {isAuthenticated ? (
                <>
                  <span className={styles.authUser} aria-label="Logged in user">
                    {authState.me?.username ?? "Account"}
                  </span>
                  <Link
                    to="/orders"
                    className={styles.authLink}
                    aria-label="Order history"
                  >
                    Orders
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className={styles.logoutButton}
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.authLink}>
                    Login
                  </Link>
                  <Link to="/register" className={styles.authLink}>
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              className={styles.cartButton}
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
              aria-label="Open shopping cart"
              type="button"
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
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <CartSidebar />
    </div>
  );
}
