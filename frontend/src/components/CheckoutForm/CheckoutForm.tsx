import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../contexts/CartContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { placeOrder } from "../../api/orders";
import styles from "./CheckoutForm.module.css";

interface FormData {
  fullName: string;
  email: string;
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const US_STATES = [
  { value: "", label: "Select a state" },
  { value: "AL", label: "Alabama" },
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "NY", label: "New York" },
  { value: "OH", label: "Ohio" },
  { value: "TX", label: "Texas" },
];

export function CheckoutForm() {
  const { state: cartState, cartItemCount, cartTotal, dispatch } = useCartContext();
  const { state: authState, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    shippingAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Full name must be at least 2 characters";
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!value.includes("@")) return "Email must contain @";
        return undefined;

      case "shippingAddress":
        if (!value.trim()) return "Shipping address is required";
        if (value.trim().length < 5) return "Address must be at least 5 characters";
        return undefined;

      case "city":
        if (!value.trim()) return "City is required";
        return undefined;

      case "state":
        if (!value) return "State is required";
        return undefined;

      case "zipCode":
        if (!value) return "Zip code is required";
        if (!/^\d{5}$/.test(value)) return "Zip code must be exactly 5 digits";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const newTouched = new Set(touched);
    newTouched.add(name);
    setTouched(newTouched);

    const error = validateField(name, formData[name as keyof FormData]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName as keyof FormData]);
      if (error) {
        newErrors[fieldName as keyof FormErrors] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      const newTouched = new Set(touched);
      Object.keys(formData).forEach((fieldName) => newTouched.add(fieldName));
      setTouched(newTouched);
      setErrors(newErrors);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const username = authState.me?.username ?? "";
      const order = await placeOrder({
        username,
        shipping: formData,
        items: cartState.items,
        total: cartTotal,
      });

      dispatch({ type: "CLEAR_CART" });
      setFormData({
        fullName: "",
        email: "",
        shippingAddress: "",
        city: "",
        state: "",
        zipCode: "",
      });
      setTouched(new Set());
      setErrors({});
      navigate(`/orders/confirmation/${encodeURIComponent(order.id)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successMessage} role="status">
          Please <Link to="/login">log in</Link> to place your order.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h2>Checkout</h2>

      <div className={styles.formGroup}>
        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={touched.has("fullName") && !!errors.fullName}
          aria-describedby={
            touched.has("fullName") && errors.fullName ? "fullName-error" : undefined
          }
          className={`${styles.input} ${
            touched.has("fullName") && errors.fullName ? styles.inputError : ""
          }`}
        />
        {touched.has("fullName") && errors.fullName && (
          <div id="fullName-error" className={styles.errorMessage} role="alert">
            {errors.fullName}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={touched.has("email") && !!errors.email}
          aria-describedby={
            touched.has("email") && errors.email ? "email-error" : undefined
          }
          className={`${styles.input} ${
            touched.has("email") && errors.email ? styles.inputError : ""
          }`}
        />
        {touched.has("email") && errors.email && (
          <div id="email-error" className={styles.errorMessage} role="alert">
            {errors.email}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shippingAddress">Shipping Address *</label>
        <input
          id="shippingAddress"
          type="text"
          name="shippingAddress"
          value={formData.shippingAddress}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={touched.has("shippingAddress") && !!errors.shippingAddress}
          aria-describedby={
            touched.has("shippingAddress") && errors.shippingAddress
              ? "shippingAddress-error"
              : undefined
          }
          className={`${styles.input} ${
            touched.has("shippingAddress") && errors.shippingAddress
              ? styles.inputError
              : ""
          }`}
        />
        {touched.has("shippingAddress") && errors.shippingAddress && (
          <div id="shippingAddress-error" className={styles.errorMessage} role="alert">
            {errors.shippingAddress}
          </div>
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="city">City *</label>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.has("city") && !!errors.city}
            aria-describedby={
              touched.has("city") && errors.city ? "city-error" : undefined
            }
            className={`${styles.input} ${
              touched.has("city") && errors.city ? styles.inputError : ""
            }`}
          />
          {touched.has("city") && errors.city && (
            <div id="city-error" className={styles.errorMessage} role="alert">
              {errors.city}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="state">State *</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.has("state") && !!errors.state}
            aria-describedby={
              touched.has("state") && errors.state ? "state-error" : undefined
            }
            className={`${styles.input} ${
              touched.has("state") && errors.state ? styles.inputError : ""
            }`}
          >
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {touched.has("state") && errors.state && (
            <div id="state-error" className={styles.errorMessage} role="alert">
              {errors.state}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="zipCode">Zip Code *</label>
          <input
            id="zipCode"
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={5}
            aria-invalid={touched.has("zipCode") && !!errors.zipCode}
            aria-describedby={
              touched.has("zipCode") && errors.zipCode ? "zipCode-error" : undefined
            }
            className={`${styles.input} ${
              touched.has("zipCode") && errors.zipCode ? styles.inputError : ""
            }`}
          />
          {touched.has("zipCode") && errors.zipCode && (
            <div id="zipCode-error" className={styles.errorMessage} role="alert">
              {errors.zipCode}
            </div>
          )}
        </div>
      </div>

      <div className={styles.orderSummary}>
        <div className={styles.summaryRow}>
          <span>Items:</span>
          <span>{cartItemCount}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Total:</span>
          <span className={styles.totalAmount}>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isProcessing || cartItemCount === 0}
        aria-label="Place order"
      >
        {isProcessing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}