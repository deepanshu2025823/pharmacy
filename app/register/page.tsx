"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

type UserProfile = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

const STORAGE_KEY = "pharmacy_user";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/checkout";

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // load existing profile (if already logged in on this device)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          password,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to register");
      }

      const json = await res.json();
      const user = json.data as UserProfile;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      router.push(nextPath);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message?.includes("error")
          ? err.message
          : "Unable to create account. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-xl md:text-2xl font-bold mb-2">
        Create your account
      </h1>
      <p className="text-xs md:text-sm text-slate-600 mb-4">
        Enter your details to continue to checkout. We&apos;ll save this in
        your profile and use it as your default delivery address.
      </p>

      {error && (
        <p className="mb-3 text-xs text-red-500">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-3 text-xs md:text-sm"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Full name
            </label>
            <input
              required
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Deepanshu Joshi"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Mobile number
            </label>
            <input
              required
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="10-digit number"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] text-slate-600">
            Email (optional)
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] text-slate-600">
            Set password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Min 6 characters"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] text-slate-600">
            Address
          </label>
          <textarea
            required
            rows={2}
            value={profile.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm resize-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="House / Flat, Street, Landmark"
          />
        </div>

        <div className="grid md:grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              City
            </label>
            <input
              required
              value={profile.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="New Delhi"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Pincode
            </label>
            <input
              required
              value={profile.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="110001"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create account & continue"}
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-1">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push(`/login?next=${encodeURIComponent(nextPath)}`)}
            className="text-emerald-600 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-xl mx-auto px-4 py-6 md:py-10">
            <div className="text-center">Loading...</div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}