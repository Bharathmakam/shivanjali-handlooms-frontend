"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword, resetPassword } from "@/lib/api";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import type { z } from "zod";
import styles from "../login/login.module.css";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Step 1: Request reset
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onForgotSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError("");
    try {
      const response = await forgotPassword(data.email);
      setEmail(data.email);
      if (response.token) {
        setResetToken(response.token);
      }
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    setValue: setResetValue,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", token: "", newPassword: "" },
  });

  const onResetSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setError("");
    try {
      await resetPassword({ email: data.email, token: data.token, newPassword: data.newPassword });
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill email and token when step 2 becomes active
  const handleStep2Mount = () => {
    setResetValue("email", email);
    if (resetToken) {
      setResetValue("token", resetToken);
    }
  };

  // Step 3: Success
  if (step === 3) {
    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <h1>Password Reset</h1>
          <p style={{ textAlign: "center", color: "#10b981", fontWeight: 600, margin: "1rem 0" }}>
            Your password has been reset successfully!
          </p>
          <button
            className={styles.loginButton}
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Enter email
  if (step === 1) {
    return (
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleForgotSubmit(onForgotSubmit)}>
          <h1>Forgot Password</h1>
          <p style={{ textAlign: "center", color: "#6b5b4f", fontSize: "0.9rem", margin: "0 0 2rem" }}>
            Enter your email address and we&apos;ll send you a reset token.
          </p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              {...registerForgot("email")}
              placeholder="you@example.com"
            />
            {forgotErrors.email && (
              <p className={styles.fieldError}>{forgotErrors.email.message}</p>
            )}
          </div>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Token"}
          </button>
          <p className={styles.footer}>
            Remember your password?{" "}
            <Link href="/login" className={styles.footerLink}>
              Login here
            </Link>
          </p>
        </form>
      </div>
    );
  }

  // Step 2: Enter token + new password
  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={handleResetSubmit(onResetSubmit)}
        ref={() => handleStep2Mount()}
      >
        <h1>Reset Password</h1>
        {resetToken && (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "0.5rem", padding: "0.8rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#92400e" }}>
            <strong>Dev Mode:</strong> Your reset token is: <code style={{ background: "#fde68a", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>{resetToken}</code>
          </div>
        )}
        <p style={{ textAlign: "center", color: "#6b5b4f", fontSize: "0.9rem", margin: "0 0 2rem" }}>
          Enter the reset token and your new password.
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <input
            type="email"
            {...registerReset("email")}
            placeholder="you@example.com"
          />
          {resetErrors.email && (
            <p className={styles.fieldError}>{resetErrors.email.message}</p>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label>Reset Token</label>
          <input
            type="text"
            {...registerReset("token")}
            placeholder="Enter the reset token"
          />
          {resetErrors.token && (
            <p className={styles.fieldError}>{resetErrors.token.message}</p>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label>New Password</label>
          <input
            type="password"
            {...registerReset("newPassword")}
            placeholder="Enter new password"
          />
          {resetErrors.newPassword && (
            <p className={styles.fieldError}>{resetErrors.newPassword.message}</p>
          )}
        </div>
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <p className={styles.footer}>
          Remember your password?{" "}
          <Link href="/login" className={styles.footerLink}>
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}