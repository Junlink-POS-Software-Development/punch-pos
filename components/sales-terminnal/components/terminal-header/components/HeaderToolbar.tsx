import { Printer, HelpCircle } from "lucide-react";
import { ShortcutsGuide } from "../ShortcutsGuide";

export const HeaderToolbar = () => {
  return (
    <div className="mt-auto">
      <span className="block mb-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
        Tools
      </span>
      <div className="flex items-center gap-2">
        <ShortcutsGuide />
        <button
          className="flex justify-center items-center bg-muted/50 hover:bg-muted border border-border rounded-lg w-10 h-10 transition-colors"
          title="Reprint Last Receipt"
        >
          <Printer className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="flex justify-center items-center bg-muted/50 hover:bg-muted border border-border rounded-lg w-10 h-10 transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
