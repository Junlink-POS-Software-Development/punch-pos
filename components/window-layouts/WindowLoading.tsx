
export const WindowLoading = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      {/* Animated spinner with glassmorphic effect */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      
      {/* Loading text with subtle animation */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-lg font-medium">Loading View</p>
        <p className="text-muted-foreground/70 text-sm">Preparing your workspace...</p>
      </div>
      
      {/* Skeleton preview of layout */}
      <div className="w-full max-w-2xl space-y-4 mt-8 px-8">
        <div className="h-12 bg-muted/50 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted/50 rounded-lg animate-pulse"></div>
          <div className="h-24 bg-muted/50 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
