import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseTerminalShortcutsProps {
  onClear: () => void;
  onCharge: () => void;
  onToggleFreeMode: () => void; // [NEW]
  hasItems: boolean;
}

export const useTerminalShortcuts = ({
  onClear,
  onCharge,
  onToggleFreeMode, // [NEW]
  hasItems,
}: UseTerminalShortcutsProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Handle Existing Escape Shortcut
      if (event.key === "Escape") {
        event.preventDefault();
        onClear();
        return;
      }

      // 2. Handle Spacebar for Payment
      if (event.code === "Space") {
        const activeElement = document.activeElement as HTMLElement;
        const isTextInput = activeElement.tagName === "INPUT" && (activeElement as HTMLInputElement).type === "text";
        const isButton = activeElement.tagName === "BUTTON";
        const isTextArea = activeElement.tagName === "TEXTAREA";

        // Allow if NOT a text input/textarea/button, OR if it IS the barcode input
        // Barcode input override is kept for workflow speed
        if ((!isTextInput && !isTextArea && !isButton) || activeElement.id === "barcode") {
           if (hasItems) {
             event.preventDefault();
             onCharge();
           }
        }
      }

      // 3. Check for ALT key combinations
      if (event.altKey) {
        const key = event.key.toLowerCase();

        switch (key) {
          case "c":
            event.preventDefault();
            router.push("/customers");
            break;
          case "d":
            event.preventDefault();
            router.push("/dashboard");
            break;
          case "t":
            event.preventDefault();
            router.push("/transactions");
            break;
          case "h":
            event.preventDefault();
            router.push("/");
            break;
          case "i":
            event.preventDefault();
            router.push("/inventory");
            break;
          case "s":
            event.preventDefault();
            router.push("/settings");
            break;
          case "e":
            event.preventDefault();
            router.push("/expenses");
            break;
          case "w":
            event.preventDefault();
            router.push("/google-workspace");
            break;
          case "f3": // Handle Alt + F3
            event.preventDefault();
            onToggleFreeMode();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClear, onCharge, hasItems, router]);
};
