// components/StockManagement.tsx
"use client";

import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { StockForm } from "./StockForm";
// 1. Import *only* the type from the new file
import { StockFormSchema } from "./utils/types";

export function StockManagement() {
  // 2. State uses the imported type
  const [latestSubmission, setLatestSubmission] =
    useState<StockFormSchema | null>(null);

  // 3. Handler uses the imported type
  const handleStockSubmit: SubmitHandler<StockFormSchema> = (data) => {
    console.log("Stock data from child form:", data);
    setLatestSubmission(data);
  };

  return (
    <div className="p-6">
      <div className="p-4 glass-effect">
        <h2 className="mb-2 font-semibold text-xl">Add Stock Entry</h2>
        <p className="mb-6 text-slate-400 text-sm">
          Fill out the form below to record a new stock movement.
        </p>

        <StockForm onSubmit={handleStockSubmit} />
      </div>
    </div>
  );
}
