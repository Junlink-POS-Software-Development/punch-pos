"use client";

import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle authentication here
    console.log("Signing in with:", { email, password });
  };

  return (
    // You can place this component inside any page,
    // e.g., a new app/login/page.tsx
    <div className="flex justify-center items-center p-6">
      <div className="p-8 rounded-2xl w-full max-w-md glass-effect">
        <h2 className="mb-8 font-bold text-white text-3xl text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-slate-300 text-sm"
            >
              Email
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full input-dark" // Use pl-10 for icon padding
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-slate-300 text-sm"
            >
              Password
            </label>
            <div className="relative">
              <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-slate-400" />
              </span>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full input-dark" // Use pl-10 for icon padding
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
}
