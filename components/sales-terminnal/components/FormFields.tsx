import React from "react"; // Added for React.Fragment

export const FormFields = React.memo(() => {
  // Helper array for fields to avoid repetition
  // Added IDs for 'htmlFor' and 'key' props
  // Corrected spelling of "Customer", "Time", etc.
  const fields = [
    { title: "Cashier Name", id: "cashierName", label: "Cashier Name:" },
    {
      title: "Transaction Time",
      id: "transactionTime",
      label: "Transaction Time:",
    },
    { title: "Payment", id: "payment", label: "Payment:" },
    { title: "Costumer Name", id: "customerName", label: "Customer Name:" },
    { title: "Transaction No.", id: "transactionNo", label: "Transaction No:" },
    { title: "Discount", id: "discount", label: "Discount:" },
    { title: "Barcode", id: "barcode", label: "Barcode:" },
    {
      title: "Available Stocks",
      id: "availableStocks",
      label: "Available Stocks:",
    },
    { title: "Grand Total", id: "grandTotal", label: "Grand Total:" },
    { title: "Quantity", id: "quantity", label: "Quantity:" },
    { title: "Costumer Price", id: "customerPrice", label: "Customer Price:" },
    { title: "Change", id: "change", label: "Change:" },
  ];

  return (
    <form action="" className="w-full h-full grow">
      {/* Grid container: 
        - grid-cols-6: Defines 6 columns (3 labels + 3 inputs)
        - grid-rows-4: Defines 4 rows
        - gap-x-4: Horizontal gap between columns (e.g., between input and next label)
        - gap-y-2: Vertical gap between rows
        - p-4: Padding inside the bordered container
        - w-full h-full: Take up full space given by parent
        - text-white: Default text color
      */}
      <div className="gap-2 grid grid-cols-6 grid-rows-4 p-4 w-full h-full text-white">
        {fields.map((field) => (
          <React.Fragment key={field.id}>
            <label
              htmlFor={field.id}
              title={field.title}
              className="right-trim flex justify-end items-center text-[50%] sm:text-[65%]"
            >
              {field.label}
            </label>

            <div className="flex items-center">
              <input
                type="text"
                id={field.id}
                className="w-full h-3 text-xs sm:text-sm truncate input-dark"
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </form>
  );
});

FormFields.displayName = "FormFields";

export default FormFields;
