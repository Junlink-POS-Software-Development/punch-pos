"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  User,
  Hash,
  LogIn,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { signUpSchema, SignUpFormValues } from "@/lib/types";
import { signUp } from "@/app/actions/auth";

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: "",
      password: "",
      enrollmentId: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setFormError("root.serverError", { message: "" });
    setSuccess(false);
    setIsPending(true);
    try {
      const result = await signUp(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      setSuccess(true);
    } catch (err) {
      console.error("Error creating account:", err);
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
          Create Member Account
        </h2>

        {success ? (
          <div className="text-green-300 text-center">
            <p className="font-semibold">Success! 🎉</p>
            <p>
              A confirmation email has been sent. You can sign in once
              confirmed.
            </p>
            <button
              onClick={onSwitchToSignIn}
              className="mt-4 font-medium text-blue-300 hover:text-blue-200"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Job Title (e.g., Sales Associate)"
                  {...register("jobTitle")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.jobTitle && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Enrollment ID */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Hash className="w-5 h-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Enrollment ID (e.g., A7B2C9)"
                  {...register("enrollmentId")}
                  className="pl-10! w-full input-dark"
                />
              </div>
              {errors.enrollmentId && (
                <p className="mt-1 text-red-300 text-sm">
                  {errors.enrollmentId.message}
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
              <span>
                {isPending ? "Creating..." : "Create Account"}
              </span>
            </button>

            <p className="pt-4 text-slate-300 text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="font-medium text-blue-300 hover:text-blue-200"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
