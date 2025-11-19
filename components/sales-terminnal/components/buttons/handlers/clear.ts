// app/inventory/components/stock-management/components/buttons/handlers/clear.ts
import { UseFormReset } from "react-hook-form";
import {
  PosFormValues,
  getDefaultFormValues,
} from "@/components/sales-terminnal/utils/posSchema"; // Adjust path
import { CartItem } from "../../TerminalCart";

type ClearParams = {
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  reset: UseFormReset<PosFormValues>;
};

export const handleClear = ({ setCartItems, reset }: ClearParams) => {
  console.log("--- [clear.ts] Clearing Transaction ---");
  setCartItems([]);
  reset(getDefaultFormValues());
};
