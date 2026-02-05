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
import { createClient } from "@/utils/supabase/client";

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
      <div className="p-8 rounded-2xl w-full max-w-md bg-card border border-border shadow-md">
        <h2 className="mb-8 font-bold text-foreground text-3xl text-center">
          Create Member Account
        </h2>

        {success ? (
          <div className="text-green-500 text-center">
            <p className="font-semibold">Success! 🎉</p>
            <p>
              A confirmation email has been sent. You can sign in once
              confirmed.
            </p>
            <button
              onClick={onSwitchToSignIn}
              className="mt-4 font-medium text-primary hover:text-primary/80"
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
                  <User className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="text"
                  placeholder="Job Title (e.g., Sales Associate)"
                  {...register("jobTitle")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.jobTitle && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Enrollment ID */}
            <div>
              <div className="relative">
                <span className="left-0 absolute inset-y-0 flex items-center pl-3">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                </span>
                <input
                  type="text"
                  placeholder="Enrollment ID (Optional)"
                  {...register("enrollmentId")}
                  className="pl-10! w-full bg-background border border-input text-foreground rounded-md focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>
              {errors.enrollmentId && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.enrollmentId.message}
                </p>
              )}
            </div>

            {errors.root?.serverError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{errors.root.serverError.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="flex justify-center items-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md transition-colors"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                } catch (err) {
                  console.error("Error signing in with Google:", err);
                }
              }}
              className="flex justify-center items-center gap-2 mb-6 w-full bg-background hover:bg-muted border border-border text-foreground py-2 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="pt-4 text-muted-foreground text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="font-medium text-primary hover:text-primary/80"
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
