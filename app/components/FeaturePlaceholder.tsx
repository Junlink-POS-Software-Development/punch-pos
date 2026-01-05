import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FeaturePlaceholderProps {
  title: string;
  description?: string;
}

export default function FeaturePlaceholder({ 
  title, 
  description = "This feature is currently under development. Stay tuned for updates!" 
}: FeaturePlaceholderProps) {
  return (
    <div className="flex flex-col justify-center items-center bg-slate-950 min-h-screen text-white">
      <div className="top-8 left-8 absolute">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      
      <div className="relative p-12 text-center">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/20 blur-3xl rounded-full w-64 h-64 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex justify-center items-center bg-slate-900/80 mb-8 border border-slate-800 shadow-2xl shadow-cyan-900/20 rounded-3xl w-24 h-24 backdrop-blur-xl">
            <Construction className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          
          <h1 className="mb-4 font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            {title}
          </h1>
          
          <div className="bg-slate-900/50 border border-slate-800 px-6 py-2 rounded-full mb-8">
            <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Coming Soon</span>
          </div>
          
          <p className="max-w-md text-lg text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
