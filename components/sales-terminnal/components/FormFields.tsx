// app/inventory/components/stock-management/components/FormFields.tsx

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import ItemAutocomplete from "../../../utils/ItemAutoComplete";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

type FormFieldsProps = {
  onAddToCartClick: () => void; // Back to sync
  onDoneSubmitTrigger: () => void;
  setActiveField?: (field: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null) => void;
  activeField?: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null;
  isTabletMode?: boolean;
};

export const FormFields = React.memo<FormFieldsProps>(
  ({ onAddToCartClick, onDoneSubmitTrigger, setActiveField, activeField, isTabletMode }) => {
    const { isPharmacy } = useBusinessMode();
    const { register, control, setValue, setFocus } =
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

      const target = e.target as HTMLInputElement;
      const fieldId = target.id as keyof PosFormValues;

      // Always prevent default to stop page reloads or double submissions
      if (fieldId !== "voucher") {
        e.preventDefault();
      }

      switch (fieldId) {
        case "customerName":
          setActiveField?.("barcode");
          break;
        case "barcode":
          setActiveField?.("quantity");
          break;
        case "quantity":
          onAddToCartClick();
          setActiveField?.("barcode");
          break;
        default:
          break;
      }
    };

    type FieldConfig = {
      title: string;
      id: keyof PosFormValues;
      label: string;
      type: "text" | "number";
      readOnly?: boolean;
      noAutoComplete?: boolean;
      hideSpinners?: boolean;
    };

    const fields: FieldConfig[] = [
      {
        title: "Customer Name",
        id: "customerName",
        label: "Customer Name:",
        type: "text",
        noAutoComplete: true,
      },
      { 
        title: isPharmacy ? "Medicine / Barcode" : "Barcode", 
        id: "barcode", 
        label: isPharmacy ? "Medicine / Barcode:" : "Barcode:", 
        type: "text" 
      },
      { title: "Quantity", id: "quantity", label: "Quantity:", type: "number" },
    ];

    const noSpinnerClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div className="flex flex-col justify-center p-2 w-full">
        {/* Changed from grid to flex row for single line layout - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 w-full text-foreground">
          {fields.map((field) => (
            <div key={field.id} className={`w-full ${field.id === "customerName" ? "sm:w-[30%]" : field.id === "barcode" ? "sm:w-[40%]" : "sm:w-[30%]"} flex flex-col gap-1`}>
              <label
                htmlFor={field.id}
                title={field.title}
                className="font-medium text-xs sm:text-sm text-muted-foreground"
              >
                {field.label}
              </label>

              <div className="w-full">
                {field.id === "barcode" ? (
                  <Controller
                    control={control}
                    name="barcode"
                    render={({
                      field: { onChange, value, onBlur, ref: formRef },
                      fieldState: { error },
                    }) => (
                      <div className="w-full">
                        <ItemAutocomplete
                          id="barcode"
                          onKeyDown={handleKeyDown}
                          ref={(e) => {
                            formRef(e);
                            (barcodeInputRef as any).current = e;
                          }}
                          value={value ? String(value) : ""}
                          onChange={onChange}
                          onBlur={() => {
                            onBlur();
                            // Optional: setActiveField?.(null); // Don't clear immediately to allow numpad to work
                          }}
                          onFocus={() => setActiveField?.("barcode")}
                          error={error?.message}
                          onItemSelect={(item) => {
                            setValue("barcode", item.sku, {
                              shouldValidate: true,
                            });
                            setActiveField?.("quantity");
                          }}
                          className="px-3 w-full h-10 sm:h-12 text-sm sm:text-base bg-background text-foreground rounded-lg border border-input focus:border-primary transition-colors focus:outline-none"
                          inputMode={isTabletMode ? "none" : undefined}
                          disableDropdown={isPharmacy}
                          showChevron={false}
                        />
                      </div>
                    )}
                  />
                ) : field.id === "quantity" ? (
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
                        type={isTabletMode ? "text" : "number"}
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
                        inputMode={isTabletMode ? "none" : undefined}
                        className={`w-full h-10 sm:h-12 text-sm sm:text-base bg-background text-foreground px-3 rounded-lg border border-input focus:border-primary transition-colors focus:outline-none ${noSpinnerClass}`}
                      />
                    )}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    autoComplete={field.noAutoComplete ? "off" : undefined}
                    {...register(field.id)}
                    readOnly={field.readOnly}
                    onFocus={() => {
                        if (field.id === "barcode") setActiveField?.("barcode");
                        else setActiveField?.(null);
                    }}
                    className={`w-full h-10 sm:h-12 text-sm sm:text-base bg-background text-foreground px-3 rounded-lg border border-input focus:border-primary transition-colors focus:outline-none ${
                      field.hideSpinners ? noSpinnerClass : ""
                    }`}
                    {...((field.id === "customerName") && {
                      onKeyDown: handleKeyDown,
                    })}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

FormFields.displayName = "FormFields";

// export default removed (named export already exists)
