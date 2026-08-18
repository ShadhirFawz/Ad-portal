"use client";

import {  FormEvent,  useEffect,  useState } from "react";

import {  useRouter } from "next/navigation";

import {  useAuth } from "@/providers/AuthProvider";

import {  getCategories } from "@/lib/api/categories";

import {  createListing } from "@/lib/api/listings";

import type {  Category } from "@/types/category";

import type {  ListingCondition } from "@/types/listing";

export default function NewListingPage() {

  const router = useRouter();
  const {
    user,
    accessToken,
    loading,
  } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("GOOD");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!user) {
      return;
    }

    getCategories()
      .then(setCategories)
      .catch(() =>
        setError(
          "Failed to load categories."
        )
      );

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
    setError(null);

    try {

      const listing =
        await createListing(
          accessToken,
          {
            categoryId,
            title,
            description,
            price: Number(price),
            pricingType: "FIXED",
            negotiable: false,
            condition,
            city: location || undefined,
          }
        );

      router.push(
        `/listings/${listing.id}/edit`
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create listing."
      );

    } finally {

      setSaving(false);
    }
  };

  return (
    <main>

      <h1>Create Listing</h1>

      <form onSubmit={handleSubmit}>

        <label>
          Category

          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value
              )
            }
            required
          >
            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Title

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            maxLength={150}
            required
          />
        </label>

        <label>
          Description

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            maxLength={5000}
            required
          />
        </label>

        <label>
          Price

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            required
          />
        </label>

        <label>
          Condition

          <select
            value={condition}
            onChange={(event) =>
              setCondition(
                event.target.value as ListingCondition
              )
            }
          >
            <option value="NEW">
              New
            </option>

            <option value="LIKE_NEW">
              Like New
            </option>

            <option value="GOOD">
              Good
            </option>

            <option value="FAIR">
              Fair
            </option>

            <option value="POOR">
              Poor
            </option>
          </select>
        </label>

        <label>
          Location

          <input
            value={location}
            onChange={(event) =>
              setLocation(
                event.target.value
              )
            }
            maxLength={150}
          />
        </label>

        {error && (
          <p>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Creating..."
            : "Create listing"}
        </button>

      </form>

    </main>
  );
}