import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

const CartDropdown = () => {
  const cart = useSelector((state: RootState) => state.cart);
  return (
    <div className="max-w-36 min-w-32 min-h-32 bg-blue-200 flex items-center justify-center">
      {cart.items.length} items
    </div>
  );
};

export default CartDropdown;
