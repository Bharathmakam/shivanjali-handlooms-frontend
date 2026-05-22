"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyOtp, resendOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import styles from "../login/login.module.css";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasted.every((char) => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(email, otpCode);
      login(response);
      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      const result = await resendOtp(email);
      setSuccess("New OTP sent to your email");
      setResendTimer(result.expiresIn || 60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  if (!email) {
    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <h1>Verify Email</h1>
          <p className={styles.error}>
            No email provided. Please register again.
          </p>
          <Link
            href="/register"
            className={styles.loginButton}
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Verify Email</h1>
        <p
          style={{
            textAlign: "center",
            color: "#6b5b4f",
            marginBottom: "1.5rem",
          }}
        >
          We sent a 6-digit code to
          <br />
          <strong style={{ color: "#2d1810" }}>{email}</strong>
        </p>

        {error && <p className={styles.error}>{error}</p>}
        {success && (
          <p
            className={styles.error}
            style={{ background: "#f0fdf4", color: "#166534" }}
          >
            {success}
          </p>
        )}

        <div className={styles.inputGroup}>
          <label>Enter OTP</label>
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: "3rem",
                  height: "3.5rem",
                  textAlign: "center",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  padding: "0.5rem",
                }}
              />
            ))}
          </div>
        </div>

        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <p className={styles.footer}>
          Didn&apos;t receive code?{" "}
          {resendTimer > 0 ? (
            <span style={{ color: "#9ca3af" }}>Resend in {resendTimer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#8b1538",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.9rem",
                padding: 0,
              }}
            >
              Resend OTP
            </button>
          )}
        </p>

        <p className={styles.footer}>
          <Link href="/register" className={styles.footerLink}>
            Back to Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={<div className={styles.container}>Loading verification...</div>}
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
