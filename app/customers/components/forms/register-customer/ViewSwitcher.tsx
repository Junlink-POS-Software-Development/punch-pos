import { User, Scan } from "lucide-react";

interface ViewSwitcherProps {
  view: "manual" | "ai-scan";
  setView: (view: "manual" | "ai-scan") => void;
}

export const ViewSwitcher = ({ view, setView }: ViewSwitcherProps) => {
  return (
    <div className="flex bg-muted/50 mb-6 p-1 border border-border rounded-xl">
      <button
        type="button"
        onClick={() => setView("manual")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
          view === "manual"
            ? "bg-accent text-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="w-4 h-4" />
        Manual Input
      </button>
      <button
        type="button"
        onClick={() => setView("ai-scan")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
          view === "ai-scan"
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Scan className="w-4 h-4" />
        AI Scan Auto Fill
      </button>
    </div>
  );
};
