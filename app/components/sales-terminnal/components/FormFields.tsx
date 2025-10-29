import React from "react"; // Added for React.Fragment

export const FormFields = () => {
  // Helper array for fields to avoid repetition
  // Added IDs for 'htmlFor' and 'key' props
  // Corrected spelling of "Customer", "Time", etc.
  const fields = [
    { id: "cashierName", label: "Cashier Name:" },
    { id: "transactionTime", label: "Transaction Time:" },
    { id: "payment", label: "Payment:" },
    { id: "customerName", label: "Customer Name:" },
    { id: "transactionNo", label: "Transaction No:" },
    { id: "discount", label: "Discount:" },
    { id: "barcode", label: "Barcode:" },
    { id: "availableStocks", label: "Available Stocks:" },
    { id: "grandTotal", label: "Grand Total:" },
    { id: "quantity", label: "Quantity:" },
    { id: "customerPrice", label: "Customer Price:" },
    { id: "change", label: "Change:" },
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
      <div className="gap-x-4 gap-y-2 grid grid-cols-6 grid-rows-4 p-4 border border-amber-100 w-full h-full text-white">
        {fields.map((field) => (
          <React.Fragment key={field.id}>
            <label
              htmlFor={field.id}
              className="flex justify-end items-center text-[50%] sm:text-[30%] truncate"
            >
              {field.label}
            </label>

            <div className="flex items-center">
              <input
                type="text"
                id={field.id}
                className="w-full text-xs sm:text-sm truncate input-dark"
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </form>
  );
};

export default FormFields;
