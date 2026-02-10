"use client";

import React, { useState, useEffect } from "react";

// --- Editable Cell Component ---
export const EditablePriceCell = ({
  initialValue,
  onUpdate,
}: {
  initialValue: number;
  onUpdate: (val: number) => void;
}) => {
  const [value, setValue] = useState(initialValue.toString());
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    // Allow empty string or valid number/decimal
    if (newVal === "" || /^\d*\.?\d*$/.test(newVal)) {
      setValue(newVal);
      setError(false);
    }
  };

  const handleBlur = () => {
    if (error || value === "") {
      setValue(initialValue.toString());
      setError(false);
    } else {
      onUpdate(Number(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      className={`w-full bg-background text-foreground px-1 py-0.5 rounded border outline-none text-right transition-colors ${
        error
          ? "border-red-500 focus:border-red-500"
          : "border-input focus:border-ring"
      }`}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    />
  );
};
