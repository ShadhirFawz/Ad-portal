"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  register,
} from "@/lib/api/auth";

export default function RegisterPage() {

  const router = useRouter();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
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

      await register({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      router.push(
        "/verify-email"
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );

    } finally {

      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Create account</h1>

      <form onSubmit={handleSubmit}>

        <input
          value={firstName}
          onChange={(event) =>
            setFirstName(event.target.value)
          }
          placeholder="First name"
          required
        />

        <input
          value={lastName}
          onChange={(event) =>
            setLastName(event.target.value)
          }
          placeholder="Last name"
        />

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Email"
          required
        />

        <input
          value={phoneNumber}
          onChange={(event) =>
            setPhoneNumber(event.target.value)
          }
          placeholder="+94771234567"
        />

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Password"
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
            ? "Creating..."
            : "Create account"}
        </button>

      </form>
    </main>
  );
}