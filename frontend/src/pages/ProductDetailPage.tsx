import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct, NotFoundError } from "../api/products";
import type { ProductResponse } from "../types/product";
import styles from "./ProductDetailPage.module.css";
import { AddToCartButton } from "../components/AddToCartButton/AddToCartButton";

type FetchState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProductResponse };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchProduct(Number(id))
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof NotFoundError) {
          setState({ status: "not-found" });
        } else {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return <p className={styles.status}>Loading product…</p>;
  }

  if (state.status === "not-found") {
    return (
      <div className={styles.notFound}>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/" className={styles.backLink}>
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return <p className={styles.error}>Error: {state.message}</p>;
  }

  const product = state.data;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Catalog
      </Link>

      <div className={styles.detail}>
        <div className={styles.imageWrapper}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name ?? "Product"}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>📦</span>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <span className={styles.category}>{product.categoryName}</span>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name ?? "Product",
              price: product.price,
              imageUrl: product.imageUrl ?? undefined,
            }}
            />
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
          <p className={styles.date}>
            Listed on{" "}
            {new Date(product.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
