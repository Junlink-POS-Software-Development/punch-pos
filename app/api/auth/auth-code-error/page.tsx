import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-6 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl glass-effect text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="mb-4 font-bold text-2xl">Authentication Error</h2>
        <p className="mb-8 text-slate-300">
          There was a problem signing you in. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-flex justify-center items-center px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
