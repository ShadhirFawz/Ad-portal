"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {

  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError(null);
    setSubmitting(true);

    try {

      await login(
        email,
        password
      );

      router.push("/");

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      );

    } finally {

      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
        />

        {error && (
          <p>{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Logging in..."
            : "Login"}
        </button>

      </form>
    </main>
  );
}