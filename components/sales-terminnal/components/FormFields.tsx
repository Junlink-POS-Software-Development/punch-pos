// app/inventory/components/stock-management/components/FormFields.tsx

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import ItemAutocomplete from "../../../utils/ItemAutoComplete";

type FormFieldsProps = {
  onAddToCartClick: () => void; // Back to sync
  onDoneSubmitTrigger: () => void;
};

export const FormFields = React.memo(
  ({ onAddToCartClick, onDoneSubmitTrigger }: FormFieldsProps) => {
    const { register, control, setValue, setFocus } =
      useFormContext<PosFormValues>();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;

      const target = e.target as HTMLInputElement;
      const fieldId = target.id as keyof PosFormValues;

      // 1. Always prevent default to stop page reloads or double submissions
      if (fieldId !== "voucher") {
        e.preventDefault();
      }

      switch (fieldId) {
        case "customerName":
          setFocus("barcode");
          break;
        case "barcode":
          setFocus("quantity");
          break;
        case "quantity":
          onAddToCartClick();
          setFocus("barcode");
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
      { title: "Barcode", id: "barcode", label: "Barcode:", type: "text" },
      { title: "Quantity", id: "quantity", label: "Quantity:", type: "number" },
    ];

    const noSpinnerClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div className="flex flex-col justify-center p-2 w-full">
        {/* Changed from grid to flex row for single line layout */}
        <div className="flex items-end gap-4 w-full text-white">
          {fields.map((field) => (
            <div key={field.id} className={`${field.id === "customerName" ? "w-[30%]" : field.id === "barcode" ? "w-[40%]" : "w-[30%]"} flex flex-col gap-1`}>
              <label
                htmlFor={field.id}
                title={field.title}
                className="font-medium text-xs sm:text-sm text-slate-400"
              >
                {field.label}
              </label>

              <div className="w-full">
                {field.id === "barcode" ? (
                  <Controller
                    control={control}
                    name="barcode"
                    render={({
                      field: { onChange, value, onBlur, ref },
                      fieldState: { error },
                    }) => (
                      <div className="w-full">
                        <ItemAutocomplete
                          id="barcode"
                          onKeyDown={handleKeyDown}
                          ref={ref}
                          value={value ? String(value) : ""}
                          onChange={onChange}
                          onBlur={onBlur}
                          error={error?.message}
                          onItemSelect={(item) => {
                            setValue("barcode", item.sku, {
                              shouldValidate: true,
                            });
                            setFocus("quantity");
                          }}
                          className="px-3 w-full h-10 sm:h-12 text-sm sm:text-base input-dark rounded-lg border-slate-700 focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    )}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    autoComplete={field.noAutoComplete ? "off" : undefined}
                    {...register(field.id, {
                      ...(field.type === "number" && { valueAsNumber: true }),
                    })}
                    readOnly={field.readOnly}
                    className={`w-full h-10 sm:h-12 text-sm sm:text-base input-dark px-3 rounded-lg border-slate-700 focus:border-cyan-500 transition-colors ${
                      field.hideSpinners ? noSpinnerClass : ""
                    }`}
                    {...(field.type === "number" &&
                      (field.id === "payment" ||
                        field.id === "voucher" ||
                        field.id === "discount" ||
                        field.id === "grandTotal" ||
                        field.id === "change") && { step: "0.01" })}
                    {...((field.id === "customerName" ||
                      field.id === "quantity" ||
                      field.id === "discount" ||
                      field.id === "payment" ||
                      field.id === "voucher") && {
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

export default FormFields;
