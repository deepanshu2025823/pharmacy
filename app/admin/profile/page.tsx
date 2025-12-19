"use client";

import { useEffect, useState } from "react";
import { Save, User } from "lucide-react";

type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  created_at: string;
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const CUSTOMER_ID = 1; // later replace with auth

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?customerId=${CUSTOMER_ID}`);
      const json = await res.json();
      setProfile(json.profile);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Update failed");

      const json = await res.json();
      setProfile(json.profile);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User /> Admin Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal and contact details
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : (
            profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={profile.name}
                  onChange={(v) => setProfile({ ...profile, name: v })} />

                <Input label="Email" value={profile.email}
                  onChange={(v) => setProfile({ ...profile, email: v })} />

                <Input label="Phone" value={profile.phone}
                  onChange={(v) => setProfile({ ...profile, phone: v })} />

                <Input label="City" value={profile.city}
                  onChange={(v) => setProfile({ ...profile, city: v })} />

                <Input label="Pincode" value={profile.pincode}
                  onChange={(v) => setProfile({ ...profile, pincode: v })} />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )
          )}

          {message && (
            <p className="mt-4 text-sm font-medium text-emerald-600">
              {message}
            </p>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
      />
    </div>
  );
}
