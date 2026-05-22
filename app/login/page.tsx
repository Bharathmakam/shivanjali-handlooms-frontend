"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";
import styles from "./login.module.css";

type LoginForm = z.infer<typeof loginSchema>;

function PasswordInput({
  register,
  errors,
}: {
  register: UseFormRegister<LoginForm>;
  errors: FieldErrors<LoginForm>;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.inputGroup}>
      <label>Password</label>
      <div className={styles.passwordWrapper}>
        <input
          type={visible ? "text" : "password"}
          {...register("password")}
          placeholder="Enter your password"
        />
        <button
          type="button"
          className={styles.togglePassword}
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {errors.password && (
        <p className={styles.fieldError}>{errors.password.message}</p>
      )}
    </div>
  );
}

function LoginContent() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const identifierValue = watch("identifier");
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifierValue);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(data);
      login(response);
      router.push(redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.inputGroup}>
          <label>Email or Phone Number</label>
          <input
            type={isEmail ? "email" : "tel"}
            {...register("identifier")}
            placeholder="you@example.com or 10-digit phone"
          />
          {errors.identifier && (
            <p className={styles.fieldError}>{errors.identifier.message}</p>
          )}
        </div>
        <PasswordInput register={register} errors={errors} />
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={styles.footerLink}>
            Register here
          </Link>
        </p>
        <p className={styles.footer} style={{ marginTop: "0.5rem" }}>
          <Link href="/forgot-password" className={styles.footerLink}>
            Forgot password?
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className={styles.container}>Loading login...</div>}
    >
      <LoginContent />
    </Suspense>
  );
}
