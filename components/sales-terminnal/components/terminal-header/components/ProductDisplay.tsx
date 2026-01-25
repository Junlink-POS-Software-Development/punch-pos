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
      <div className="flex flex-col items-start justify-center h-full">
        {/* Item Display */}
        <div className="flex flex-col justify-center items-start space-y-1 mt-0 text-left">
          <h1
            className={`text-2xl md:text-4xl font-bold tracking-tight font-lexend drop-shadow-lg transition-colors line-clamp-2 max-w-[90%] ${
              isBackdating ? "text-amber-100" : "text-cyan-50"
            }`}
          >
            {currentProduct.name}
          </h1>
          <p
            className={`text-3xl md:text-4xl font-lexend font-black tracking-tighter transition-colors ${
              isBackdating ? "text-amber-300" : "text-cyan-300"
            }`}
          >
            {currentProduct.price}
          </p>
        </div>

        {/* Stock Status */}
        <div className="flex justify-start mt-2">
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
      </div>
    </>
  );
};
