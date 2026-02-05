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
        <div className="flex flex-col justify-center items-start mt-0 text-left">
          <h1
            className={`text-1xl md:text-4xl font-bold tracking-tight font-lexend drop-shadow-sm transition-colors line-clamp-2 max-w-full ${
              isBackdating ? "text-amber-500" : "text-foreground"
            }`}
          >
            {currentProduct.name}
          </h1>
          <p
            className={`text-2xl md:text-4xl font-lexend font-black tracking-tighter transition-colors ${
              isBackdating ? "text-amber-600" : "text-primary"
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
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-green-500/10 text-green-600 border-green-500/20"
            }`}
          >
            STOCKS: {currentProduct.stock}
          </div>
        </div>
      </div>
    </>
  );
};
