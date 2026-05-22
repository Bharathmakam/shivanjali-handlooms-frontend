"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/api";

import { registerSchema } from "@/lib/validations";
import type { z } from "zod";
import styles from "../login/login.module.css";

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordInput({
  register,
  errors,
  name,
  label,
  placeholder,
}: {
  register: UseFormRegister<RegisterForm>;
  errors: FieldErrors<RegisterForm>;
  name: "password" | "confirmPassword";
  label: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.inputGroup}>
      <label>{label}</label>
      <div className={styles.passwordWrapper}>
        <input
          type={visible ? "text" : "password"}
          {...register(name)}
          placeholder={placeholder}
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
      {errors[name] && (
        <p className={styles.fieldError}>{errors[name].message}</p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1>Create Account</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.nameRow}>
          <div className={styles.inputGroup}>
            <label>First Name</label>
            <input {...register("firstName")} placeholder="Enter first name" />
            {errors.firstName && (
              <p className={styles.fieldError}>{errors.firstName.message}</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Last Name</label>
            <input {...register("lastName")} placeholder="Enter last name" />
            {errors.lastName && (
              <p className={styles.fieldError}>{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className={styles.fieldError}>{errors.email.message}</p>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            {...register("phone")}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
          {errors.phone && (
            <p className={styles.fieldError}>{errors.phone.message}</p>
          )}
        </div>
        <PasswordInput
          register={register}
          errors={errors}
          name="password"
          label="Password"
          placeholder="Min 8 characters"
        />
        <PasswordInput
          register={register}
          errors={errors}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter password"
        />
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.footerLink}>
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
