import { Search } from "lucide-react";

const SearchBar = () => (
  <div className="hidden md:block relative">
    <Search className="top-1/2 left-3 absolute w-4 h-4 text-slate-400 -translate-y-1/2" />
    <input
      type="text"
      placeholder="Search..."
      className="bg-slate-800/50 py-2.5 pr-4 pl-10 border border-slate-700 focus:border-cyan-500/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 w-64 text-slate-200 text-sm transition-all"
    />
  </div>
);

export default SearchBar;
