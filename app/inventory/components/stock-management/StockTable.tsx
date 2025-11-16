"use client";

import { useState } from "react";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css"; // Ensure styles are imported

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
  };

  const handleDelete = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Defined the shared header styling here
  const headerClass =
    "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center backdrop-blur-2xl";

  const columns: Column<StockRow>[] = [
    {
      key: "itemName",
      name: "Item Name",
      headerCellClass: headerClass,
    },
    {
      key: "stockFlow",
      name: "Stock Flow",
      headerCellClass: headerClass,
    },
    {
      key: "quantity",
      name: "Quantity",
      headerCellClass: headerClass,
    },
    {
      key: "capitalPrice",
      name: "Capital Price",
      headerCellClass: headerClass,
    },
    {
      key: "notes",
      name: "Notes",
      headerCellClass: headerClass,
    },
    {
      key: "timestamp",
      name: "Timestamp",
      headerCellClass: headerClass,
    },
    {
      key: "actions",
      name: "Actions",
      width: 100, // Added width here
      headerCellClass: headerClass, // Added class here
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
              borderRadius: "4px",
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
              borderRadius: "4px",
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataGrid
        columns={columns}
        rows={rows}
        className="border-none"
        style={{ height: "63vh" }}
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
      />
    </div>
  );
}
