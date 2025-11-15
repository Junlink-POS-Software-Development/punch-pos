"use client";

import { useState } from "react";
import { DataGrid, Column } from "react-data-grid";

type StockRow = {
  id: number;
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice: number;
  notes: string;
  timestamp: string;
};

const initialRows: StockRow[] = [
  {
    id: 1,
    itemName: "Widget A",
    stockFlow: "In",
    quantity: 50,
    capitalPrice: 200,
    notes: "First batch",
    timestamp: new Date().toLocaleString(),
  },
  {
    id: 2,
    itemName: "Widget B",
    stockFlow: "Out",
    quantity: 10,
    capitalPrice: 80,
    notes: "Sold to client",
    timestamp: new Date().toLocaleString(),
  },
];

export default function StockTable() {
  const [rows, setRows] = useState<StockRow[]>(initialRows);

  const handleEdit = (id: number) => {
    alert(`Edit row with id: ${id}`);
    // Replace with modal or form logic
  };

  const handleDelete = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const columns: Column<StockRow>[] = [
    { key: "itemName", name: "Item Name" },
    { key: "stockFlow", name: "Stock Flow" },
    { key: "quantity", name: "Quantity" },
    { key: "capitalPrice", name: "Capital Price" },
    { key: "notes", name: "Notes" },
    { key: "timestamp", name: "Timestamp" },
    {
      key: "actions",
      name: "Actions",
      renderCell: ({ row }) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => handleEdit(row.id)}
            style={{
              background: "#4caf50",
              color: "white",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            style={{
              background: "#f44336",
              color: "white",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <DataGrid columns={columns} rows={rows} />
    </div>
  );
}
