import { CalendarClock, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface TimeDisplayProps {
  isBackdating: boolean;
  customTransactionDate: string | null;
  setCustomTransactionDate: (date: string | null) => void;
}

export const TimeDisplay = ({
  isBackdating,
  customTransactionDate,
  setCustomTransactionDate,
}: TimeDisplayProps) => {
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const getNow = () =>
      new Date()
        .toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/,/, "");

    const initialTimeout = setTimeout(() => setLiveTime(getNow()), 0);
    const timer = setInterval(() => setLiveTime(getNow()), 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="text-right">
      {isBackdating ? (
        <div className="group relative flex flex-col items-end cursor-pointer">
          <div className="flex items-center gap-2 group-hover:opacity-60 font-bold text-amber-400 text-sm transition-all animate-pulse group-hover:animate-none">
            <CalendarClock className="w-4 h-4" />
            <span>
              {dayjs(customTransactionDate).format("MMM DD, YYYY h:mm A")}
            </span>
          </div>
          <span className="group-hover:hidden bg-amber-950/30 mt-1 px-2 py-0.5 rounded font-bold text-[10px] text-amber-500/80 uppercase tracking-widest">
            Backdating Active
          </span>
          <button
            onClick={() => setCustomTransactionDate(null)}
            className="hidden top-0 right-0 absolute group-hover:flex items-center gap-2 bg-red-500/90 hover:bg-red-600 shadow-lg backdrop-blur-sm px-3 py-1 rounded font-medium text-white text-xs whitespace-nowrap transition-all"
          >
            <XCircle className="w-3 h-3" />
            <span>End Session</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end">
          <span className="font-lexend font-bold text-cyan-400 text-sm tracking-wider">
            {liveTime}
          </span>
          <span className="text-[10px] text-cyan-400/50 uppercase tracking-widest">
            System Time
          </span>
        </div>
      )}
    </div>
  );
};
