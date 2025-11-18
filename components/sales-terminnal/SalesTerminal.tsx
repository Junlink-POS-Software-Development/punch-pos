// app/inventory/components/stock-management/SalesTerminal.tsx
"use client"; // Make sure this is present if using 'use client' directives

import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  posSchema,
  PosFormValues,
  getDefaultFormValues,
} from "./utils/posSchema";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-in/SignUp";
import { X } from "lucide-react";
import { handleLogOut } from "./components/buttons/handlers";
import { supabase } from "@/lib/supabaseClient";

// --- NEW IMPORTS ---
import "react-data-grid/lib/styles.css"; // <-- Import DataGrid CSS
import { useItems } from "../../app/inventory/components/item-registration/context/ItemsContext";
import TerminalCart, { CartItem } from "./components/TerminalCart"; // <-- Import new component and type

type AuthModalState = "hidden" | "signIn" | "signUp";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");

  // --- react-hook-form initialization ---
  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: getDefaultFormValues(),
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- NEW: Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- NEW: Get items from context ---
  const { items: allItems } = useItems(); // 'items' from context has all product data

  // --- useEffect for auth state ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // --- modal handlers ---
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModal();
  };
  const handleLogoutClick = async () => {
    const loggedOut = await handleLogOut();
    if (loggedOut) {
      setIsLoggedIn(false);
    } else {
      console.error("Failed to log out.");
    }
  };

  // --- NEW: Cart Handlers ---

  /**
   * Adds the item from the form to the cart state.
   */
  const handleAddToCart = () => {
    const { barcode, quantity } = methods.getValues();

    if (!barcode) {
      alert("Please select an item first.");
      return;
    }
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    // Find the full item details from our ItemsContext
    const itemDetails = allItems.find((item) => item.sku === barcode);

    if (!itemDetails) {
      alert("Item not found. Please check the SKU/Barcode.");
      return;
    }

    // Get Unit Price from context (as requested: items.costPrice)
    const unitPrice = itemDetails.costPrice;
    const total = quantity * unitPrice;

    // Check if item is already in the cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.sku === barcode
    );

    if (existingItemIndex !== -1) {
      // --- Update existing item ---
      setCartItems((prevCart) =>
        prevCart.map((item, index) => {
          if (index === existingItemIndex) {
            // Add to existing quantity and total
            const newQuantity = item.quantity + quantity;
            const newTotal = item.total + total;
            return { ...item, quantity: newQuantity, total: newTotal };
          }
          return item;
        })
      );
    } else {
      // --- Add new item to cart ---
      const newCartItem: CartItem = {
        id: barcode, // Use SKU as the unique ID
        sku: barcode,
        itemName: itemDetails.itemName,
        unitPrice: unitPrice,
        quantity: quantity,
        total: total,
      };
      setCartItems((prevCart) => [...prevCart, newCartItem]);
    }

    // --- Reset form fields ---
    methods.resetField("barcode");
    methods.resetField("quantity");
    // You might also want to reset availableStocks if it's tied to the barcode field
    methods.setValue("availableStocks", 0);
  };

  /**
   * Removes an item from the cart by its SKU.
   */
  const handleRemoveItem = (sku: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // --- layout logic ---
  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
    return ""; // fallback
  }

  // --- submit handler ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = (data) => {
    console.log("Form Data:", data);
    console.log("Cart Items:", cartItems); // Also log the cart
    // Reset if needed:
    // methods.reset(getDefaultFormValues());
    // setCartItems([]); // Clear cart on done
  };

  return (
    <div className="flex flex-col p-1 h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center bg-primary-dark marquee-screen">
        <h1 className="text-text-primary sm:text-1xl md:text-3xl lg:text-4xl marquee-text">
          POINT OF SALE
        </h1>
        <h2 className="text-text-primary">
          {isLoggedIn ? "Welcome User!" : "Please Sign In"}
        </h2>
      </div>

      {/* FormProvider + form */}
      <FormProvider {...methods}>
        <form
          id="sales-form"
          onSubmit={methods.handleSubmit(onDoneSubmit)}
          className={`gap-1 grid ${ScreenLogic()} w-full h-full overflow-hidden`}
        >
          <div className="relative flex flex-col w-full h-full">
            <FormFields onAddToCartClick={handleAddToCart} />{" "}
            {/* <-- Pass prop here */}
            <TerminalButtons
              isLoggedIn={isLoggedIn}
              onSignInClick={openSignInModal}
              onLogoutClick={handleLogoutClick}
              onAddToCartClick={handleAddToCart}
            />
          </div>

          <div className="border border-primary-light rounded-2xl w-full h-full overflow-hidden">
            <TerminalCart rows={cartItems} onRemoveItem={handleRemoveItem} />
          </div>
        </form>
      </FormProvider>

      {/* Auth Modal */}
      {authModalState !== "hidden" && (
        <div
          className="z-40 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {authModalState === "signIn" ? (
              <SignIn
                onSwitchToSignUp={openSignUpModal}
                onSuccess={handleLoginSuccess}
              />
            ) : (
              <SignUp onSwitchToSignIn={openSignInModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
