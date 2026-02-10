// Mobile Form Fields - Barcode and Quantity on same row with +/- buttons
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../../utils/posSchema";
import ItemAutocomplete from "../../../../utils/ItemAutoComplete";
import { Plus, Minus, ScanBarcode } from "lucide-react";

type MobileFormFieldsProps = {
  onAddToCartClick: () => void;
  setActiveField?: (field: "barcode" | "quantity" | null) => void;
  activeField?: "barcode" | "quantity" | null;
};

export const MobileFormFields = React.memo<MobileFormFieldsProps>(
  ({ onAddToCartClick, setActiveField, activeField }) => {
    const { register, control, setValue, setFocus, getValues, watch } =
      useFormContext<PosFormValues>();

    // Direct refs for inputs to ensure reliable focus
    const barcodeInputRef = React.useRef<HTMLInputElement>(null);
    const quantityInputRef = React.useRef<HTMLInputElement>(null);

    const focusBarcode = React.useCallback(() => {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
    }, []);

    const focusQuantity = React.useCallback(() => {
      setTimeout(() => {
        quantityInputRef.current?.focus();
      }, 50);
    }, []);

    // Listen to activeField prop changes to set focus
    React.useEffect(() => {
      if (activeField === "barcode") {
        focusBarcode();
      } else if (activeField === "quantity") {
        focusQuantity();
      }
    }, [activeField, focusBarcode, focusQuantity]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      const target = e.target as HTMLInputElement;
      const fieldId = target.id;

      if (fieldId === "barcode") {
        setActiveField?.("quantity");
      } else if (fieldId === "quantity") {
        onAddToCartClick();
        setActiveField?.("barcode");
      }
    };

    const handleIncreaseQty = () => {
      const currentQty = getValues("quantity") || 0;
      setValue("quantity", currentQty + 1, { shouldValidate: true });
    };

    const handleDecreaseQty = () => {
      const currentQty = getValues("quantity") || 0;
      if (currentQty > 1) {
        setValue("quantity", currentQty - 1, { shouldValidate: true });
      }
    };

    const noSpinnerClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div className="flex items-end gap-2 w-full text-foreground p-2">
        {/* Barcode Field - Takes most space */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <label
            htmlFor="barcode"
            className="font-medium text-xs text-muted-foreground"
          >
            Barcode / Item:
          </label>
          <div className="relative flex items-center">
             <Controller
                control={control}
                name="barcode"
                render={({
                  field: { onChange, value, onBlur, ref: formRef },
                  fieldState: { error },
                }) => (
                  <ItemAutocomplete
                    id="barcode"
                    onKeyDown={handleKeyDown}
                    ref={(e) => {
                      formRef(e);
                      (barcodeInputRef as any).current = e;
                    }}
                    value={value ? String(value) : ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={() => setActiveField?.("barcode")}
                    error={error?.message}
                    onItemSelect={(item) => {
                      setValue("barcode", item.sku, { shouldValidate: true });
                      setActiveField?.("quantity");
                    }}
                    className="pl-3 pr-10 w-full h-10 text-sm bg-background text-foreground rounded-lg border border-border focus:border-primary transition-colors focus:outline-none"
                  />
                )}
              />
              <button
                type="button"
                className="absolute right-2 p-1 text-muted-foreground hover:text-primary transition-colors"
                // Placeholder for future functionality
              >
                <ScanBarcode className="w-4 h-4" />
              </button>
          </div>
        </div>

        {/* Quantity Section - Compact with +/- */}
        <div className="flex flex-col gap-1 shrink-0">
          <label
            htmlFor="quantity"
            className="font-medium text-xs text-slate-400"
          >
            Qty:
          </label>
          <div className="flex items-center gap-1">
            {/* Minus Button */}
            <button
              type="button"
              onClick={handleDecreaseQty}
              className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Quantity Input */}
            <Controller
              control={control}
              name="quantity"
              render={({
                field: { onChange, value, onBlur, ref: formRef },
              }) => (
                <input
                  ref={(e) => {
                    formRef(e);
                    (quantityInputRef as any).current = e;
                  }}
                  type="number"
                  id="quantity"
                  value={value === null || value === undefined ? "" : value}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      onChange(null);
                    } else {
                      const num = parseInt(val, 10);
                      onChange(isNaN(num) ? null : num);
                    }
                  }}
                  onBlur={onBlur}
                  onFocus={() => setActiveField?.("quantity")}
                  onKeyDown={handleKeyDown}
                  className={`w-14 h-10 text-center text-sm bg-background text-foreground rounded-lg border border-border focus:border-primary transition-colors focus:outline-none ${noSpinnerClass}`}
                />
              )}
            />

            {/* Plus Button */}
            <button
              type="button"
              onClick={handleIncreaseQty}
              className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MobileFormFields.displayName = "MobileFormFields";

export default MobileFormFields;
