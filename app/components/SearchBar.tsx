import { Search } from "lucide-react";

const SearchBar = () => (
  <div className="flex-1 flex items-center relative group min-w-0 max-w-md">
    <Search className="left-3.5 absolute w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
    <input
      type="text"
      placeholder="Search transactions..."
      className="bg-slate-800/40 hover:bg-slate-800/60 py-2 pr-4 md:pr-12 pl-10 border border-slate-700/50 focus:border-cyan-500/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 w-full text-slate-200 text-sm transition-all placeholder:text-slate-500"
    />
    <div className="right-3 absolute hidden md:flex items-center gap-1 opacity-50 pointer-events-none">
      <kbd className="bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600 font-sans text-[10px] text-slate-400">
        Ctrl
      </kbd>
      <kbd className="bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600 font-sans text-[10px] text-slate-400">
        K
      </kbd>
    </div>
  </div>
);

export default SearchBar;
