// FormFields.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
// Adjust this import path to where your component is located
import { ItemAutocomplete } from "../../../utils/ItemAutoComplete";

export const FormFields = React.memo(() => {
  // Get form methods from the FormProvider context
  const {
    register,
    control, // Needed for the Autocomplete Controller
    setValue, // Needed to force the SKU value
  } = useFormContext<PosFormValues>();

  // Define a type for the field configuration
  type FieldConfig = {
    title: string;
    id: keyof PosFormValues; // Ensure id is a key of PosFormValues
    label: string;
    type: "text" | "number";
    readOnly?: boolean; // Make readOnly optional
  };

  // Helper array for fields with explicit type
  const fields: FieldConfig[] = [
    {
      title: "Cashier Name",
      id: "cashierName",
      label: "Cashier Name:",
      type: "text",
      readOnly: true,
    },
    {
      title: "Transaction Time",
      id: "transactionTime",
      label: "Transaction Time:",
      type: "text",
      readOnly: true,
    },
    { title: "Payment", id: "payment", label: "Payment:", type: "number" },
    {
      title: "Costumer Name",
      id: "customerName",
      label: "Customer Name:",
      type: "text",
    },
    {
      title: "Transaction No.",
      id: "transactionNo",
      label: "Transaction No:",
      type: "text",
      readOnly: true,
    },
    { title: "Voucher", id: "voucher", label: "Voucher:", type: "number" },
    {
      title: "Barcode",
      id: "barcode",
      label: "Barcode:",
      type: "text",
      // CHANGED: set to false so user can type "Ashitaba" to search
      readOnly: false,
    },
    {
      title: "Available Stocks",
      id: "availableStocks",
      label: "Available Stocks:",
      type: "number",
      readOnly: true,
    },
    {
      title: "Grand Total",
      id: "grandTotal",
      label: "Grand Total:",
      type: "number",
      readOnly: true,
    },
    { title: "Quantity", id: "quantity", label: "Quantity:", type: "number" },
    { title: "Discount", id: "discount", label: "Discount:", type: "number" },
    {
      title: "Change",
      id: "change",
      label: "Change:",
      type: "number",
      readOnly: true,
    },
  ];

  return (
    <div className="w-full h-full grow">
      <div className="grid grid-cols-6 grid-rows-4 w-full h-full text-white">
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
              {/* CONDITIONAL RENDERING: Special logic for Barcode */}
              {field.id === "barcode" ? (
                <Controller
                  control={control}
                  name="barcode"
                  render={({
                    field: { onChange, value, onBlur },
                    fieldState: { error },
                  }) => (
                    <div className="w-full">
                      {/* Wrapped in div to manage width since ItemAutocomplete is w-full */}
                      <ItemAutocomplete
                        value={value ? String(value) : ""}
                        onChange={onChange} // Allows typing updates
                        onBlur={onBlur}
                        error={error?.message}
                        onItemSelect={(item) => {
                          // 1. The component sets value to item.itemName internally.
                          // 2. We immediately overwrite it with the SKU.
                          setValue("barcode", item.sku, {
                            shouldValidate: true,
                          });

                          // Optional: You might also want to auto-fill other fields
                          // like price or quantity here using setValue if needed.
                          // setValue("quantity", 1);
                        }}
                        // --- THIS IS THE FIX ---
                        className="w-full h-3 text-[60%]! truncate input-dark"
                        // -----------------------
                      />
                    </div>
                  )}
                />
              ) : (
                // STANDARD RENDERING for all other fields
                <input
                  type={field.type}
                  id={field.id}
                  {...register(field.id, {
                    ...(field.type === "number" && { valueAsNumber: true }),
                  })}
                  readOnly={field.readOnly}
                  className="w-full h-3 text-[60%]! truncate input-dark"
                  {...(field.type === "number" &&
                    (field.id === "payment" ||
                      field.id === "voucher" ||
                      field.id === "discount") && { step: "0.01" })}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

FormFields.displayName = "FormFields";

export default FormFields;
