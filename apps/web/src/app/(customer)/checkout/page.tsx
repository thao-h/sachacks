"use client";
import { UpdateOrderStatusInput } from "@/server/modules/orders/schemas";
import{useState} from "react";

interface CartItem{
  id:number;
  name: string;
  price: number;
  quantity: number;
}

interface FormData{
  name: string;
  email: string;
  phone: string;
  address: string;
  orderType: string;
}

const cartItems: CartItem[] = [
  { id: 1, name: "Pad Thai", price: 14.99, quantity: 1},
  { id: 2, name: "Spring Rolls", price: 6.99, quantity: 2},
];

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    name:"",
    email: "",
    phone: "", 
    address: "",
    orderType: "delivery",
  })
  const[message, setMessage] = useState("");

  const total = cartItems.reduce((sum, item)=>sum+item.price * item.quantity, 0);

  // handle input changes
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
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection:"column", gap: "1rem"}}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <input
          type="phone number"
          name="phone number"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        {formData.orderType === "delivery" && (
          <input
            type="text"
            name="address"
            placeholder="Delivery Address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
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
