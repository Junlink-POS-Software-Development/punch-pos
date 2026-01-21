interface ProductDisplayProps {
  currentProduct: {
    name: string;
    price: string;
    stock: number;
  };
  isBackdating: boolean;
}

export const ProductDisplay = ({
  currentProduct,
  isBackdating,
}: ProductDisplayProps) => {
  return (
    <>
      {/* Item Display */}
      <div className="flex flex-col justify-center items-end space-y-1 mt-0 text-right">
        <h1
          className={`text-2xl md:text-4xl font-bold tracking-tight font-(family-name:--font-lexend) drop-shadow-lg transition-colors line-clamp-2 max-w-[90%] ${
            isBackdating ? "text-amber-100" : "text-cyan-50"
          }`}
        >
          {currentProduct.name}
        </h1>
        <p
          className={`text-4xl md:text-5xl font-(family-name:--font-lexend) font-black tracking-tighter transition-colors ${
            isBackdating ? "text-amber-300" : "text-cyan-300"
          }`}
        >
          {currentProduct.price}
        </p>
      </div>

      {/* Stock Status */}
      <div className="flex justify-end mt-1 pt-0">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
            currentProduct.stock === 0
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          STOCKS: {currentProduct.stock}
        </div>
      </div>
    </>
  );
};
