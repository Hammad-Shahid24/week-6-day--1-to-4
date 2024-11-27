import { FC, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/LoadingAnimation.json";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  EyeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/20/solid";
import Swal from "sweetalert2";
import { RootState } from "../app/store";
import { useSelector, useDispatch } from "react-redux";
import { Product } from "../types/Product";
import { addItem, removeItem, updateQuantity } from "../redux/cart/cartSlice";
import { toast } from "react-toastify";

const ProductCataloguePage: FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number, number]
  >([0, 1000]);
  const [selectedRating, setSelectedRating] = useState<number[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://fakestoreapi.com/products`);
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        const errorMessage =
          axios.isAxiosError(error) && error.message
            ? `Network error: ${error.message}`
            : "Some error occurred";
        setError(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Multi-criteria Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearchQuery = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= selectedPriceRange[0] &&
        product.price <= selectedPriceRange[1];
      const matchesRating =
        selectedRating.length === 0 ||
        selectedRating.includes(Math.floor(product.rating.rate));

      return (
        matchesSearchQuery && matchesCategory && matchesPrice && matchesRating
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedRating,
  ]);

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (page - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const previewProduct = useCallback((product: Product) => {
    Swal.fire({
      title: product.title,
      html: `
        <div class="flex flex-col sm:flex-row justify-center items-center">
          <img src="${product.image}" class="w-full sm:w-64 h-64 object-contain mx-auto" />
          <div class="flex flex-col justify-center mt-4 sm:mt-0 sm:ml-4">
            <p class="text-left mt-2 sm:mt-4">Category: ${product.category}</p>
            <p class="text-left mt-2 h-24 overflow-y-auto">Description: ${product.description}</p>          
            <p class="text-left mt-2">Price: $${product.price}</p>
            <p class="text-left mt-2">Rating: ${product.rating.rate}★</p>
          </div>
        </div>
        `,
      showConfirmButton: false,
    });
  }, []);

  const openFilterModal = () => {
    Swal.fire({
      title: "Apply Filters",
      html: `
        <div class="space-y-4 text-left ">
          <!-- Category Filter -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Select Category</label>
            <select id="category" class="swal2-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <option value="All">All Categories</option>
              <option value="men's clothing">Men's Clothing</option>
              <option value="jewelery">Jewelry</option>
              <option value="electronics">Electronics</option>
              <option value="women's clothing">Women's Clothing</option>
            </select>
          </div>
          
          <!-- Price Range Filter -->
          <div class="flex flex-col items-center sm:flex-row justify-between sm:items-center" >
            <label for="priceRange" class="block text-sm font-medium text-gray-700">Price Range ($)</label>
            <input type="range" id="priceRange" min="0" max="1000" value="${
              selectedPriceRange[1]
            }" class="swal2-input mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <span id="priceValue" class="block mt-1  text-center min-w-16 text-sm text-gray-500">$${
              selectedPriceRange[1]
            }</span>
          </div>
          
          <!-- Rating Filter -->
          <div class="flex flex-col space-y-2">
            <label for="rating" class="block text-sm font-medium text-gray-700">Select Rating</label>
            <div id="rating" class="flex w-fit mx-auto space-x-2 mt-1">
              ${[1, 2, 3, 4, 5]
                .map(
                  (rating) => `
                <label class="flex items-center space-x-1">
                  <input type="checkbox" class="rating-checkbox" value="${rating}" ${
                    selectedRating.includes(rating) ? "checked" : ""
                  } class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <span class="text-sm text-gray-700">${rating}★</span>
                </label>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
      preConfirm: () => {
        const category = (
          document.getElementById("category") as HTMLSelectElement
        ).value;
        const price = parseInt(
          (document.getElementById("priceRange") as HTMLInputElement).value
        );
        const ratings = Array.from(
          document.querySelectorAll(".rating-checkbox:checked")
        ).map((checkbox: any) => parseInt(checkbox.value));
        setSelectedCategory(category);
        setSelectedPriceRange([0, price]);
        setSelectedRating(ratings);
        setPage(1); // Reset page to 1 after applying filters
      },
      didOpen: () => {
        const categorySelect = document.getElementById(
          "category"
        ) as HTMLSelectElement;
        categorySelect.value = selectedCategory;

        const priceRangeInput = document.getElementById(
          "priceRange"
        ) as HTMLInputElement;
        const priceValue = document.getElementById("priceValue");
        priceRangeInput.oninput = () => {
          if (priceValue) {
            priceValue.innerHTML = `$${priceRangeInput.value}`;
          }
        };
      },
    });
  };

  const handleAddItem = (product: Product) => {
    console.log(product);
    try {
      if (cart.items.find((item) => item.id === product.id.toString())) {
        console.log("Item already in cart");
        dispatch(
          updateQuantity({
            id: product.id.toString(),
            quantity:
              (cart.items.find((item) => item.id === product.id.toString())
                ?.quantity ?? 0) + 1,
          })
        );
        toast.info("Item quantity updated", { autoClose: 500 });
      } else {
        console.log("Item not in cart");
        dispatch(
          addItem({
            id: product.id.toString(),
            name: product.title,
            price: product.price,
            image: product.image,
            quantity: 1,
          })
        );
        toast.success("Item added to cart", { autoClose: 500 });
      }
    } catch {
      toast.error("Failed to add item to cart", { autoClose: 500 });
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-9/12 mx-auto">
        {/* Search and Filter Section */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mt-4 max-w-screen-lg mx-auto sm:px-8 ">
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset page to 1
            }}
            className="p-2 border border-gray-300 text-supremeRed focus:outline-supremeRed active:border-supremeRed rounded-sm"
          />

          <button className="border p-1 border-gray-300 flex justify-center">
            <FunnelIcon
              onClick={openFilterModal}
              className={`h-8 ${
                selectedCategory === "All" ? "text-gray-400" : "text-supremeRed"
              }`}
            />
          </button>
        </div>

        {/* Product Grid */}
        <div className="flex flex-wrap justify-center mt-4 ">
          {loading ? (
            <Lottie
              animationData={loadingAnimation}
              style={{ width: 300, height: 300 }}
              loop
              autoplay
            />
          ) : (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                className="relative bg-white border border-gray-200 hover:border-gray-400 p-4 w-60 transition-all duration-300 ease-in-out cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-contain mb-2 rounded-lg transform transition duration-300"
                />
                <div className="absolute bottom-0 right-0 left-0 top-0 flex justify-around items-center px-4 py-1 bg-white bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleAddItem(product)}
                    className="bg-gray-700 hover:bg-gray-900 text-white p-2 rounded-full  transition-colors duration-300"
                  >
                    <ShoppingBagIcon className="h-6" />
                  </button>
                  <button
                    onClick={() => previewProduct(product)}
                    className="bg-supremeRed text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-300"
                  >
                    <EyeIcon className="h-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!error && (
          <div className="relative flex justify-center items-center my-4 space-x-1">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`px-2 ${
                page === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-supremeRed text-white"
              }`}
            >
              <ChevronLeftIcon className="h-8" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-2 ${
                page === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-supremeRed text-white"
              }`}
            >
              <ChevronRightIcon className="h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCataloguePage;
