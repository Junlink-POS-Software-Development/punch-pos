import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseTerminalShortcutsProps {
  onClear: () => void;
}

export const useTerminalShortcuts = ({
  onClear,
}: UseTerminalShortcutsProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Handle Existing Escape Shortcut (remains the same)
      if (event.key === "Escape") {
        event.preventDefault();
        onClear();
        return;
      }

      // 2. Check for ALT key combinations
      // This prevents conflicts with CTRL+T, CTRL+S, etc.
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
          case "r":
            event.preventDefault();
            router.push("/reports");
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
  }, [onClear, router]);
};
