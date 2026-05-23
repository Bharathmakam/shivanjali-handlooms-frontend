"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  checkCodEligibility,
  getAddresses,
} from "@/lib/api";
import { checkoutSchema } from "@/lib/validations";
import type { z } from "zod";
import type { CodEligibilityResponse, Address } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./checkout.module.css";

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const { user } = useAuth();
  const [codStatus, setCodStatus] = useState<CodEligibilityResponse>({
    available: true,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      pinCode: "",
      paymentMethod: "RAZORPAY",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (!user) return;
    setValue("name", `${user.firstName} ${user.lastName}`);
    setValue("email", user.email);
    setValue("phone", user.phone);
  }, [user, setValue]);

  useEffect(() => {
    if (!user) return;

    const loadAddresses = async () => {
      try {
        const addresses = await getAddresses();
        setSavedAddresses(addresses);

        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setValue("name", defaultAddr.name);
          setValue("phone", defaultAddr.phone);
          setValue("address", defaultAddr.addressLine);
          setValue("pinCode", defaultAddr.pinCode);
        }
      } catch {
        console.warn("Failed to load addresses");
      }
    };

    loadAddresses();
  }, [user, setValue]);

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Add some items to your cart before checking out.</p>
        <button
          onClick={() => router.push("/shop")}
          className={styles.shopButton}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handlePinCodeChange = async (value: string) => {
    if (value.length === 6) {
      const res = await checkCodEligibility(value, subtotal);
      setCodStatus(res);
      if (!res.available && paymentMethod === "COD") {
        setValue("paymentMethod", "RAZORPAY");
      }
    }
  };

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setValue("name", addr.name);
    setValue("phone", addr.phone);
    setValue("address", addr.addressLine);
    setValue("pinCode", addr.pinCode);
  };

  const initiateRazorpayPayment = async (
    orderData: Record<string, unknown>,
  ) => {
    try {
      const paymentOrder = await createPaymentOrder(total);

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: paymentOrder.amount,
        currency: "INR",
        name: "Shivanjali Handlooms",
        description: `Order Payment`,
        order_id: paymentOrder.id,
        handler: async (response: RazorpayCheckoutResponse) => {
          try {
            await verifyPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || paymentOrder.id,
              signature: response.razorpay_signature,
            });

            const finalOrderData = {
              ...orderData,
              razorpayOrderId: response.razorpay_order_id || paymentOrder.id,
              razorpayPaymentId: response.razorpay_payment_id,
            };
            const order = await createOrder(finalOrderData);
            clearCart();
            router.push(`/order-confirmation/${order.id}`);
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : "Payment verification failed";
            alert(message);
            setLoading(false);
          }
        },
        prefill: {
          name: watch("name"),
          email: watch("email"),
          contact: watch("phone"),
        },
        theme: {
          color: "#8b1538",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: unknown) {
      console.error("Razorpay error:", err);
      const message = err instanceof Error ? err.message : "Payment failed";
      alert(message);
      setLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);

    const orderItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderData = {
      items: orderItems,
      pinCode: data.pinCode,
      paymentMethod: data.paymentMethod,
      customerDetails: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
      subtotal,
      shippingCost,
      total,
    };

    if (data.paymentMethod === "RAZORPAY") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => initiateRazorpayPayment(orderData);
      script.onerror = () => {
        alert("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      try {
        const order = await createOrder(orderData);
        clearCart();
        router.push(`/order-confirmation/${order.id}`);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create order";
        alert(message);
        setLoading(false);
      }
    }
  };

  const finalTotal = total;

  return (
    <div className={styles.checkoutContainer}>
      <h1>Checkout</h1>

      <div className={styles.checkoutContent}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {savedAddresses.length > 0 && (
            <div className={styles.savedAddresses}>
              <h2>Saved Addresses</h2>
              <div className={styles.addressList}>
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selected : ""}`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleAddressSelect(addr)}
                    />
                    <div>
                      <strong>{addr.name}</strong>
                      <p>{addr.addressLine}</p>
                      <p>
                        {addr.city}
                        {addr.city && addr.state ? ", " : ""}
                        {addr.state} - {addr.pinCode}
                      </p>
                      <p>{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <h2>Shipping Information</h2>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input {...register("name")} />
            {errors.name && (
              <p className={styles.fieldError}>{errors.name.message}</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" {...register("email")} />
            {errors.email && (
              <p className={styles.fieldError}>{errors.email.message}</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Phone Number</label>
            <input {...register("phone")} />
            {errors.phone && (
              <p className={styles.fieldError}>{errors.phone.message}</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Full Address</label>
            <textarea {...register("address")} />
            {errors.address && (
              <p className={styles.fieldError}>{errors.address.message}</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>PIN Code</label>
            <input
              {...register("pinCode")}
              maxLength={6}
              onChange={(e) => {
                register("pinCode").onChange(e);
                handlePinCodeChange(e.target.value);
              }}
            />
            {errors.pinCode && (
              <p className={styles.fieldError}>{errors.pinCode.message}</p>
            )}
          </div>

          <h2>Payment Method</h2>
          <div className={styles.paymentMethods}>
            <label>
              <input
                type="radio"
                {...register("paymentMethod")}
                value="RAZORPAY"
              />
              Online Payment (Razorpay)
            </label>
            <label className={!codStatus.available ? styles.disabled : ""}>
              <input
                type="radio"
                {...register("paymentMethod")}
                value="COD"
                disabled={!codStatus.available}
              />
              Cash on Delivery
            </label>
            {!codStatus.available && (
              <p className={styles.error}>{codStatus.reason}</p>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Processing..."
              : `PLACE ORDER (₹${finalTotal.toFixed(2)})`}
          </button>
        </form>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className={styles.totals}>
            <p>
              Subtotal: <span>₹{subtotal.toFixed(2)}</span>
            </p>
            <p>
              Shipping:{" "}
              <span>{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
            </p>
            {shippingCost > 0 && (
              <p className={styles.freeShippingNote}>
                Free shipping on orders above ₹5,000
              </p>
            )}
            <hr />
            <p className={styles.grandTotal}>
              Total: <span>₹{finalTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}