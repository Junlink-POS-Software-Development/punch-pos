export type CartItem = {
  id: string;
  sku: string;
  itemName: string;
  unitPrice: number;
  discount: number;
  quantity: number;
  total: number;
};

export type TerminalCartProps = {
  rows: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
};
