import { Column } from "react-data-grid";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { InventoryItem } from "../lib/inventory.api";
import { HeaderWithFilter } from "@/components/reusables/HeaderWithFilter";


interface GetColumnsProps {
  inventory: InventoryItem[];
  filters: Record<string, string[]>;
  sortState: {
    col: keyof InventoryItem | null;
    dir: "ASC" | "DESC" | null;
  };
  onApplyFilter: (key: string, values: string[]) => void;
  onSort: (col: keyof InventoryItem, dir: "ASC" | "DESC" | null) => void;
}

export const getStocksColumns = ({
  inventory,
  filters,
  sortState,
  onApplyFilter,
  onSort,
}: GetColumnsProps): Column<InventoryItem>[] => [
  {
    key: "sku",
    name: "SKU",
    width: "1fr",
    renderHeaderCell: (props) => (
      <HeaderWithFilter<InventoryItem>
        {...props}
        allData={inventory}
        filters={filters}
        onApplyFilter={onApplyFilter}
        sortState={sortState}
        onSort={onSort}
      />
    ),
  },
  {
    key: "item_name",
    name: "Item Name",
    width: "1fr",
    renderHeaderCell: (props) => (
      <HeaderWithFilter<InventoryItem>
        {...props}
        allData={inventory}
        filters={filters}
        onApplyFilter={onApplyFilter}
        sortState={sortState}
        onSort={onSort}
      />
    ),
  },
  {
    key: "quantity_in",
    name: "Total In",
    width: "1fr",
    renderCell: ({ row }) => (
      <span className="text-green-400/80">+{row.quantity_in}</span>
    ),
    headerCellClass: "cursor-pointer hover:bg-slate-800/50",
  },
  {
    key: "quantity_sold",
    name: "Sold",
    width: "1fr",
    renderCell: ({ row }) => (
      <span className="text-blue-400/80">-{row.quantity_sold}</span>
    ),
  },
  {
    key: "quantity_out",
    name: "Pulled Out",
    width: "1fr",
    renderCell: ({ row }) => (
      <span className="text-red-400/80">-{row.quantity_out}</span>
    ),
  },
  {
    key: "current_stock",
    name: "Live Stock",
    width: "1fr",
    renderCell: ({ row }) => {
      const isLow = row.current_stock <= 5;
      return (
        <div
          className={`flex items-center gap-2 font-bold ${
            isLow ? "text-red-500" : "text-green-500"
          }`}
        >
          {isLow ? <AlertTriangle size={14} /> : <PackageCheck size={14} />}
          {row.current_stock}
        </div>
      );
    },
  },
];