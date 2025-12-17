"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { signInSchema, SignInFormValues } from "@/lib/types";
import { login } from "@/app/actions/auth";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

const signInUser = async (values: SignInFormValues) => {
  const result = await login(values);

  if (!result.success) {
    throw new Error(result.error);
  }
};

export function SignIn({ onSwitchToSignUp, onSuccess }: SignInProps) {
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setFormError("root.serverError", { message: "" });
    setIsPending(true);
    try {
      await signInUser(values);
      console.log("Sign in successful and role verified.");
      onSuccess();
    } catch (err) {
      console.error("Error signing in:", err);
      setFormError("root.serverError", {
        type: "server",
        message: (err as Error).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <div className="p-8 rounded-2xl w-full max-w-md glass-effect">
        <h2 className="mb-8 font-bold text-white text-3xl text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register("email")}
                // FIX: Changed to pl-10!
                className={`pl-10! w-full input-dark ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.email.message}
              </p>
            )}
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
                {...register("password")}
                // FIX: Changed to pl-10!
                className={`pl-10! w-full input-dark ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-red-300 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isPending ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        <p className="pt-6 text-slate-300 text-sm text-center">
          First time user?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="font-medium text-blue-300 hover:text-blue-200"
          >
            Sign up with your company code.
          </button>
        </p>
      </div>
    </div>
  );
}
