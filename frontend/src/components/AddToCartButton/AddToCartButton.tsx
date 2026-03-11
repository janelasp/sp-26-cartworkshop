import { useState } from "react";
import { useCartContext } from "../../contexts/CartContext";
import type { ReactNode } from "react";
import styles from "./AddToCartButton.module.css";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { dispatch } = useCartContext();

  const handleClick = () => {
    dispatch({
      type: "ADD_TO_CART",
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const buttonText: ReactNode = isAdded ? "Added!" : "Add to Cart";

  return (
    <button
      onClick={handleClick}
      className={`${styles.button} ${isAdded ? styles.added : ""}`}
      aria-label={`Add ${product.name} to cart`}
      disabled={isAdded}
      type="button"
    >
      {buttonText}
    </button>
  );
}