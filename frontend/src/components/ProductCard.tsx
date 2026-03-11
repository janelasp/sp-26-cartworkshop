import { Link } from "react-router-dom";
import type { ProductResponse } from "../types/product";
import styles from "./ProductCard.module.css";
import { AddToCartButton } from "./AddToCartButton/AddToCartButton";

interface ProductCardProps {
  product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps){

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.cardLink}>
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
        <div className={styles.body}>
          <span className={styles.category}>{product.categoryName}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className={styles.cardActions}>

          <AddToCartButton 
          product={{
            id: product.id,
            name: product.name ?? "Product",
            price: product.price,
            imageUrl: product.imageUrl ?? undefined,
          }} 
          />
      </div>
    </div>
  );
}
