// app/inventory/components/stock-management/components/FormFields.tsx

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import ItemAutocomplete from "../../../utils/ItemAutoComplete";

type FormFieldsProps = {
  onAddToCartClick: () => void;
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

      e.preventDefault(); // <--- This stops the form from submitting!

      switch (fieldId) {
        case "customerName":
          setFocus("barcode");
          break;
        case "barcode":
          setFocus("quantity");
          break;
        case "quantity":
          setFocus("discount");
          break;
        case "discount":
          onAddToCartClick();
          setFocus("barcode");
          break;
        case "payment":
          setFocus("voucher");
          break;
        case "voucher":
          onDoneSubmitTrigger();
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
        title: "Transaction No.",
        id: "transactionNo",
        label: "Transaction No:",
        type: "text",
        readOnly: true,
      },
      {
        title: "Payment",
        id: "payment",
        label: "Payment:",
        type: "number",
        hideSpinners: true,
      },
      { title: "Barcode", id: "barcode", label: "Barcode:", type: "text" },
      {
        title: "Voucher",
        id: "voucher",
        label: "Voucher:",
        type: "number",
        hideSpinners: true,
      },
      {
        title: "Grand Total",
        id: "grandTotal",
        label: "Grand Total:",
        type: "number",
        readOnly: true,
      },
      { title: "Quantity", id: "quantity", label: "Quantity:", type: "number" },
      {
        title: "Discount",
        id: "discount",
        label: "Discount:",
        type: "number",
        hideSpinners: true,
      },
      {
        title: "Change",
        id: "change",
        label: "Change:",
        type: "number",
        readOnly: true,
      },
    ];

    const noSpinnerClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div className="w-full h-full grow">
        <div className="grid grid-cols-6 grid-rows-3 w-full h-[80%] text-white">
          {fields.map((field) => (
            <React.Fragment key={field.id}>
              <label
                htmlFor={field.id}
                title={field.title}
                className="right-trim flex justify-end items-center text-[50%] sm:text-[65%]"
              >
                {field.label}
              </label>

              <div className="flex items-center w-full">
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
                          className="w-full h-3 text-[60%]! truncate input-dark"
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
                    className={`w-full h-3 text-[60%]! truncate input-dark ${
                      field.hideSpinners ? noSpinnerClass : ""
                    }`}
                    {...(field.type === "number" &&
                      (field.id === "payment" ||
                        field.id === "voucher" ||
                        field.id === "discount") && { step: "0.01" })}
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
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);

FormFields.displayName = "FormFields";

export default FormFields;
