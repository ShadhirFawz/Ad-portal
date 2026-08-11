"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/providers/AuthProvider";

import {
  updateMyProfile,
} from "@/lib/api/users";

export default function ProfilePage() {

  const router = useRouter();
  const {
    user,
    accessToken,
    loading,
  } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {

      setFirstName(user.firstName);
      setLastName(user.lastName ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
      setLocation(user.location ?? "");
      setPublicProfile(user.publicProfile);
    }

  }, [
    user,
    loading,
    router,
  ]);

  if (loading || !user) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (!accessToken) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {

      await updateMyProfile(
        accessToken,
        {
          firstName,
          lastName,
          username,
          bio,
          location,
          publicProfile,
        }
      );

      setMessage(
        "Profile updated successfully."
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );

    } finally {

      setSaving(false);
    }
  };

  return (
    <main>
      <h1>My Profile</h1>

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
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="Username"
        />

        <textarea
          value={bio}
          onChange={(event) =>
            setBio(event.target.value)
          }
          placeholder="Tell people about yourself"
          maxLength={500}
        />

        <input
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          placeholder="Location"
        />

        <label>
          <input
            type="checkbox"
            checked={publicProfile}
            onChange={(event) =>
              setPublicProfile(
                event.target.checked
              )
            }
          />

          Public profile
        </label>

        {message && (
          <p>{message}</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save changes"}
        </button>

      </form>
    </main>
  );
}