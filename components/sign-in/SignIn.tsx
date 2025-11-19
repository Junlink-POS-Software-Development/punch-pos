// SignIn.tsx (Refactored with pl-10!)

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { signInSchema, SignInFormValues } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

const signInUser = async (values: SignInFormValues) => {
  const APP_TYPE = "member";

  const { data: sessionData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

  if (signInError) {
    throw signInError;
  }

  if (!sessionData?.user) {
    throw new Error("Sign in successful but no user data found.");
  }

  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", sessionData.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    console.error("Error fetching user profile:", profileError.message);
    throw new Error("Could not verify user role. Please try again.");
  }

  if (userData.role !== APP_TYPE) {
    await supabase.auth.signOut();
    if (userData.role === "admin") {
      throw new Error("Access denied. Admins must sign in via the admin app.");
    } else {
      throw new Error(
        `Access denied. Your role (${userData.role}) is not 'member'.`
      );
    }
  }
};

export function SignIn({ onSwitchToSignUp, onSuccess }: SignInProps) {
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

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: () => {
      console.log("Sign in successful and role verified.");
      onSuccess();
    },
    onError: (err: Error) => {
      console.error("Error signing in:", err);
      setFormError("root.serverError", {
        type: "server",
        message: err.message,
      });
    },
  });

  const onSubmit = (values: SignInFormValues) => {
    setFormError("root.serverError", { message: "" });
    mutation.mutate(values);
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

          {mutation.isError && errors.root?.serverError && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex justify-center items-center gap-2 w-full btn-3d-glass"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{mutation.isPending ? "Signing In..." : "Sign In"}</span>
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
