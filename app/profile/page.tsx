"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "pharmacy_user";

type StoredUser = {
  id?: number;
  name?: string;
};

type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  created_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load logged-in user from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) {
      router.push("/login?next=/profile");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      if (!parsed.id) {
        router.push("/login?next=/profile");
        return;
      }
      setStoredUser(parsed);
      fetchProfile(parsed.id);
    } catch {
      router.push("/login?next=/profile");
    }
  }, [router]);

  const fetchProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile?customerId=${id}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to load profile");
      }
      const data = await res.json();
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof Profile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          pincode: profile.pincode,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update profile");
      }

      const data = await res.json();
      setProfile(data.profile);
      setSuccess("Profile updated successfully");

      // localStorage में भी updated name रख दो ताकि header में तुरंत दिखे
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredUser;
          window.localStorage.setItem(
            USER_KEY,
            JSON.stringify({ ...parsed, name: data.profile.name })
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setSavingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.id,
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">My profile</h1>
              {profile && (
                <p className="text-xs md:text-sm text-slate-600">
                  Account created on{" "}
                  {new Date(profile.created_at || "").toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  )}
                </p>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Loading profile…</p>
          )}

          {!loading && !profile && (
            <p className="text-sm text-red-500">
              {error || "Profile not found. Please login again."}
            </p>
          )}

          {profile && (
            <>
              {(error || success) && (
                <div className="text-xs md:text-sm">
                  {error && (
                    <div className="mb-2 rounded-lg bg-red-50 text-red-700 px-3 py-2">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-2 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2">
                      {success}
                    </div>
                  )}
                </div>
              )}

              {/* View / Edit section */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Account details</h2>
                  <span className="text-[11px] text-slate-500">
                    View / edit your information
                  </span>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-3 text-xs md:text-sm"
                >
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        Full name
                      </label>
                      <input
                        value={profile.name}
                        onChange={(e) =>
                          handleProfileChange("name", e.target.value)
                        }
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        Mobile number
                      </label>
                      <input
                        value={profile.phone}
                        onChange={(e) =>
                          handleProfileChange("phone", e.target.value)
                        }
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      required
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={profile.address}
                      onChange={(e) =>
                        handleProfileChange("address", e.target.value)
                      }
                      required
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-[2fr_1fr] gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        City
                      </label>
                      <input
                        value={profile.city}
                        onChange={(e) =>
                          handleProfileChange("city", e.target.value)
                        }
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        Pincode
                      </label>
                      <input
                        value={profile.pincode}
                        onChange={(e) =>
                          handleProfileChange("pincode", e.target.value)
                        }
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {savingProfile ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>

              {/* Password section */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Change password</h2>
                  <span className="text-[11px] text-slate-500">
                    Update your login password
                  </span>
                </div>

                <form
                  onSubmit={handleChangePassword}
                  className="space-y-3 text-xs md:text-sm"
                >
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-600">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        New password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-600">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 disabled:opacity-60"
                    >
                      {savingPassword ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
