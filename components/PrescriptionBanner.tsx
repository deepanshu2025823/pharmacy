// components/PrescriptionBanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
};

const USER_KEY = "pharmacy_user";
const SUPPORT_NUMBER = "(+91) 8368436412";
const CART_LOCALSTORAGE_KEY = "pharmacy_cart";

type PrescriptionSummary = {
  count: number;
  lastDate?: string;
};

type MatchedProduct = {
  medicine_id: number;
  product_name: string;
  price?: number;
  qty?: number;
  image_url?: string | null;
};

export default function PrescriptionBanner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<StoredUser | null>(null);
  const [summary, setSummary] = useState<PrescriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // load user from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // load prescriptions summary for user
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/prescriptions?customerId=${user.id}`);
        if (!res.ok) throw new Error("Failed to load prescriptions");
        const json = await res.json();
        const rows: any[] = json.data ?? [];

        if (!rows.length) {
          setSummary({ count: 0 });
          return;
        }

        const count = rows.length;
        const lastDate = rows[0]?.created_at
          ? new Date(rows[0].created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : undefined;

        setSummary({ count, lastDate });
      } catch (err) {
        console.error(err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const handleUploadClick = () => {
    if (!user?.id) {
      alert("Please log in before uploading a prescription.");
      router.push("/login?next=/");
      return;
    }
    fileInputRef.current?.click();
  };

  const mergeIntoLocalCart = (toAdd: any[]) => {
    try {
      const raw = window.localStorage.getItem(CART_LOCALSTORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      for (const newItem of toAdd) {
        const idx = current.findIndex((c: any) => c.id === newItem.id);
        if (idx >= 0) {
          current[idx].qty = current[idx].qty + newItem.qty;
        } else {
          current.push(newItem);
        }
      }
      window.localStorage.setItem(CART_LOCALSTORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("pharmacy_cart_updated"));
    } catch (err) {
      console.error("mergeIntoLocalCart error", err);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    // guard: make sure user still logged in
    if (!user?.id) {
      alert("Please log in before uploading a prescription.");
      router.push("/login?next=/");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // For now we only send the filename
      const payload = {
        customerId: user.id,
        fileUrl: file.name,
        notes: "Uploaded from homepage",
      };

      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to upload prescription");
      }

      const json = await res.json();
      const created = json.data;
      const matched: MatchedProduct[] = json.matchedProducts ?? [];

      // Update local summary
      setSummary((prev) => {
        const prevCount = prev?.count ?? 0;
        const lastDate = created?.created_at
          ? new Date(created.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : prev?.lastDate;
        return {
          count: prevCount + 1,
          lastDate,
        };
      });

      if (matched.length > 0) {
        const toAdd = matched.map((p) => ({
          id: p.medicine_id,
          product_name: p.product_name,
          qty: p.qty ?? 1,
          mrp: Number(p.price ?? 0),
          image_url: p.image_url ?? undefined,
          from_prescription: true
        }));

        // Try to use lib/cart.addToCart if available
        try {
          const cartModule = await import("@/lib/cart");
          if (typeof cartModule.addToCart === "function") {
            for (const it of toAdd) {
              // addToCart might be async
              await cartModule.addToCart(it);
            }
            // dispatch update event (if the module exports event name)
            const evName = cartModule.CART_UPDATED_EVENT ?? "pharmacy_cart_updated";
            window.dispatchEvent(new Event(evName));
          } else {
            mergeIntoLocalCart(toAdd);
          }
        } catch (err) {
          // fallback
          console.warn("lib/cart import failed — falling back", err);
          mergeIntoLocalCart(toAdd);
        }

        alert(`Added ${toAdd.length} product${toAdd.length === 1 ? "" : "s"} to your cart from the prescription.`);
      } else {
        // No matched products
        alert(`No products matched your prescription. Please contact support: ${SUPPORT_NUMBER}`);
      }

      // Clear input safely via ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      alert("Unable to upload prescription right now.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewOrders = () => {
    router.push("/orders");
  };

  const summaryText = (() => {
    if (!user?.id) {
      return "Login to upload and track your prescriptions.";
    }
    if (loading) return "Loading your prescriptions...";
    if (!summary) return "Upload your first prescription to get started.";
    if (!summary.count) return "No prescriptions uploaded yet.";
    if (summary.lastDate) {
      return `You have uploaded ${summary.count} prescription${summary.count === 1 ? "" : "s"}. Last uploaded on ${summary.lastDate}.`;
    }
    return `You have uploaded ${summary.count} prescription${summary.count === 1 ? "" : "s"}.`;
  })();

  return (
    <section className="max-w-6xl mx-auto px-3 mt-6" id="upload-prescription">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base md:text-lg font-semibold mb-1">Order via Prescription</h2>
          <p className="text-xs md:text-sm text-slate-600 mb-2">
            Upload your prescription and we will prepare your order in minutes.
          </p>
          <ul className="text-xs md:text-sm text-slate-600 space-y-1 mb-3">
            <li>• Pharmacist will verify your prescription</li>
            <li>• Get medicines delivered at your doorstep</li>
          </ul>
          <p className="text-[11px] md:text-xs text-slate-500">{summaryText}</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Prescription"}
          </button>

          <button
            type="button"
            onClick={handleViewOrders}
            className="px-4 py-2 rounded-full border border-slate-200 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View All Orders
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </section>
  );
}