import { useState } from "react";

const CartTest = () => {
  const userId = "USER_ID";  // Apna actual user ID daal (Database se le)
  const productId = "PRODUCT_ID";  // Kisi existing product ka ID daal
  const [cartData, setCartData] = useState(null);

  // ✅ Fetch Cart Items
  const fetchCart = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cart/get/${userId}`);
      const data = await res.json();
      setCartData(data);
      console.log("Cart Data:", data);
    } catch (error) {
      console.error("Fetch Cart Error:", error);
    }
  };

  // ✅ Add Item to Cart
  const addToCart = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });
      const data = await res.json();
      console.log("Add to Cart:", data);
    } catch (error) {
      console.error("Add Cart Error:", error);
    }
  };

  // ✅ Update Cart Item Quantity
  const updateCart = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cart/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 2 }),
      });
      const data = await res.json();
      console.log("Update Cart:", data);
    } catch (error) {
      console.error("Update Cart Error:", error);
    }
  };

  // ✅ Delete Cart Item
  const deleteCartItem = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cart/${userId}/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log("Delete Cart Item:", data);
    } catch (error) {
      console.error("Delete Cart Error:", error);
    }
  };

  return (
    <div>
      <h2>Cart API Test</h2>
      <button onClick={fetchCart}>Fetch Cart</button>
      <button onClick={addToCart}>Add to Cart</button>
      <button onClick={updateCart}>Update Quantity</button>
      <button onClick={deleteCartItem}>Delete Item</button>
      <pre>{JSON.stringify(cartData, null, 2)}</pre>
    </div>
  );
};

export default CartTest;

// This is client/src/components/CartTest.js