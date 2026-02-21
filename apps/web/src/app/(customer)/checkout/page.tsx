"use client";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  orderType: string;
}

const cartItems: CartItem[] = [
  { id: 1, name: "Pad Thai", price: 14.99, quantity: 1 },
  { id: 2, name: "Spring Rolls", price: 6.99, quantity: 2 },
];

export default function CheckoutPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    orderType: "delivery",
  });
  const [message, setMessage] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle payment and order submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate required fields
    if (!formData.name || !formData.email || !formData.phone || (formData.orderType === "delivery" && !formData.address)) {
      setMessage("Please fill out all required fields.");
      return;
    }

    if (!stripe || !elements) {
      setMessage("Stripe not loaded yet. Please try again.");
      return;
    }

    setMessage("Processing payment...");

    // 1️⃣ In real setup: call backend to create PaymentIntent
    // For demo, we'll skip backend and simulate success
    // const res = await fetch("/api/create-payment-intent", { method: "POST", body: JSON.stringify({ amount: total * 100 }) });
    // const { clientSecret } = await res.json();

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage("Card information is missing.");
      return;
    }

    // 2️⃣ Confirm card payment (demo: simulate success)
    // const result = await stripe.confirmCardPayment(clientSecret, {
    //   payment_method: { card: cardElement, billing_details: { name: formData.name, email: formData.email } }
    // });

    // if (result.error) {
    //   setMessage(`Payment failed: ${result.error.message}`);
    //   return;
    // }

    // 3️⃣ Save order to database (simulated)
    console.log("Order Submitted:", { ...formData, items: cartItems, total });

    setMessage(`Payment successful! Your order total is $${total.toFixed(2)}`);
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Checkout</h1>

      <h2>Order Summary</h2>
      <div style={{ marginBottom: "1.5rem" }}>
        {cartItems.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: "0.5rem" }}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
        {formData.orderType === "delivery" && (
          <input
            type="text"
            name="address"
            placeholder="Delivery Address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
        )}
        <select
          name="orderType"
          value={formData.orderType}
          onChange={handleChange}
        >
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>

        {/* Stripe Card Element */}
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: 4 }}>
          <CardElement />
        </div>

        <button type="submit" disabled={!stripe} style={{ padding: "0.5rem 1rem" }}>
          Pay ${total.toFixed(2)}
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}