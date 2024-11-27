import { FC, useState, useEffect, useRef } from "react";
import SupremeLogo from "../assets/supreme.svg";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/20/solid";
import { RootState } from "../app/store";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, updateQuantity } from "../redux/cart/cartSlice";
import { toast } from "react-toastify";

const Header: FC = () => {
  const cart = useSelector((state: RootState) => state.cart.items);
  console.log(cart);
  const dispatch = useDispatch();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeZone = "Asia/Karachi";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const zonedDate = toZonedTime(currentDateTime, timeZone);
  const formattedDate = format(zonedDate, "MM/dd/yyyy hh:mma zzz");

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
    toast.success("Item removed from cart", { autoClose: 500 });
  };

  const handleIncrementQuantity = (id: string) => {
    if (cart.find((item) => item.id === id)) {
      const previousQuantity = cart.find((item) => item.id === id)!.quantity;
      dispatch(
        updateQuantity({
          id,
          quantity: previousQuantity + 1,
        })
      );
      toast.info("Item quantity updated", { autoClose: 500 });
    }
  };

  const handleDecrementQuantity = (id: string) => {
    if (cart.find((item) => item.id === id)) {
      const previousQuantity = cart.find((item) => item.id === id)!.quantity;
      if (previousQuantity === 1) {
        dispatch(removeItem(id));
        toast.success("Item removed from cart", { autoClose: 500 });
      } else {
        dispatch(
          updateQuantity({
            id,
            quantity: previousQuantity - 1,
          })
        );
        toast.info("Item quantity updated", { autoClose: 500 });
      }
    }
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto my-12  flex flex-col justify-center items-center relative ">
      <img
        className="w-32 h-10 scale-110 pt-0.5 my-2 bg-supremeRed"
        src={SupremeLogo}
        alt="supreme"
      />
      <h1 className=" mt-3 font-thin text-sm font-courierPrime">
        {formattedDate}
      </h1>
      <div
        onMouseEnter={() => setDropdownVisible(true)}
        // onMouseLeave={() => setDropdownVisible(false)}
        className="flex items-center absolute  top-4 right-4 md:right-12"
      >
        <ShoppingCartIcon className=" h-6 w-6 text-supremeRed" />{" "}
        <sup className="text-lg   text-supremeRed rounded-full px-1  text-center font-bold">
          {cart.length}
        </sup>
        {dropdownVisible && (
          <div
            ref={dropdownRef}
            className="absolute top-8 right-8 min-w-64 md:min-w-96 bg-white border-gray-300 border rounded-md p-4 shadow-lg z-10"
          >
            <div>
              {cart.length === 0 ? (
                <p className="text-gray-500">
                  Your cart is empty. Try adding some items to the cart.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-normal mb-2 bg-gray-100 p-2 rounded-md"
                    >
                      <img
                        className="w-16 h-16 rounded-md"
                        src={item.image}
                        alt={"product image"}
                      />
                      <div className="ml-4 flex-1 relative h-16 ">
                        <p className="text-sm truncate w-36  md:w-56 font-courierPrime ">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 font-courierPrime">
                          ${item.price.toFixed(2)}{" "}
                          <span className="text-supremeRed">x</span>{" "}
                          {item.quantity}
                        </p>
                        <div className="flex w-full justify-between items-center absolute bottom-0 left-0 space-x-2">
                          <button
                            onClick={() => {
                              handleRemoveItem(item.id);
                            }}
                            className="hover:drop-shadow-lg transition-all  duration-300 rounded-md text-xs text-supremeRed font-courierPrime"
                          >
                            Remove
                          </button>
                          <div className="flex items-center gap-2 mr-4">
                            <button
                              onClick={() => {
                                handleIncrementQuantity(item.id);
                              }}
                              className="hover:drop-shadow-lg transition-all duration-300 pb-1 rounded-md text-xs text-black  font-courierPrime flex items-center"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                handleDecrementQuantity(item.id);
                              }}
                              className="hover:drop-shadow-lg transition-all duration-300 pb-1 rounded-md text-xs text-black  font-courierPrime flex items-center"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-300 px- mt-2 pt-2 flex justify-between items-center ">
                <span className="font-bold font-courierPrime">Total:</span>
                <span className="font-bold font-courierPrime text-supremeRed">
                  $
                  {cart
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
