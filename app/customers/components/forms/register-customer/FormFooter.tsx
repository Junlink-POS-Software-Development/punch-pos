import { Loader2 } from "lucide-react";

interface FormFooterProps {
  onCancel: () => void;
  loading: boolean;
  isCompressing: boolean;
}

export const FormFooter = ({ onCancel, loading, isCompressing }: FormFooterProps) => {
  return (
    <div className="p-6 border-border border-t">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-accent hover:bg-accent/80 py-3 rounded-xl font-bold text-foreground transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="customer-form"
          disabled={loading || isCompressing}
          className="flex flex-1 justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-primary/20 shadow-lg py-3 rounded-xl font-bold text-primary-foreground transition-all disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Register Customer"
          )}
        </button>
      </div>
    </div>
  );
};
