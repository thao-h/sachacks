"use client";
import { UpdateOrderStatusInput } from "@/server/modules/orders/schemas";
import{useState} from "react";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name:"",
    email: "",
    phone: "", 
    address: "",
    orderType: "delivery",
  })
  const[message, setMessage] = useState("");

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.email || !formData.phone){
      setMessage("Please fill out required fields.");
      return;
    }
    console.log("Order Submitted:", formData);
    setMessage("Order placed successfully!");
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection:"column", gap: "1rem"}}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="phone number"
          name="phone number"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {formData.orderType === "delivery" && (
          <input
            type="text"
            name="address"
            placeholder="Delivery Address"
            value={formData.address}
            onChange={handleChange}
            required
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

        <button type="submit">Place Order</button>
      </form>
      
        {message && <p style={{marginTop:"1rem"}}>{message}</p>}
      <p>Checkout form coming soon.</p>
    </main>
  );
}
