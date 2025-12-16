// app/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { readCart, type CartItem, CART_UPDATED_EVENT } from "@/lib/cart";
import { QRCodeCanvas } from "qrcode.react";

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
};

const USER_KEY = "pharmacy_user";
const BUSINESS_UPI_ID = "webesidetech@oksbi";

type PaymentMethod = "COD" | "UPI";

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("Faridabad");
  const [state, setState] = useState("Haryana");
  const [pincode, setPincode] = useState("121005");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // QR safety

  // load cart and user
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    try {
      const rawUser = window.localStorage.getItem(USER_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as StoredUser;
        setUser(parsed || null);
        if (parsed?.name) setFullName(parsed.name);
        if (parsed?.phone) setPhone(parsed.phone as string);
      }
    } catch {
      // ignore
    }

    const syncCartFromStorage = () => {
      const items = readCart();
      setCartItems(items);
      if (!items || items.length === 0) {
        router.replace("/");
      }
    };

    syncCartFromStorage();

    const handleCartUpdated = () => {
      syncCartFromStorage();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.mrp || 0) * (item.qty || 0), 0),
    [cartItems]
  );

  const deliveryFee = cartItems.length > 0 ? 25 : 0;
  const discount = 0;
  const totalAmount = subtotal + deliveryFee - discount;

  const upiAmount = totalAmount < 0 ? 0 : totalAmount;
  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: BUSINESS_UPI_ID,
      pn: "Pharmacy",
      am: upiAmount.toFixed(2),
      cu: "INR",
      tn: "Pharmacy order payment",
    });
    return `upi://pay?${params.toString()}`;
  }, [upiAmount]);

  const handleUPIPayClick = () => {
    if (typeof window === "undefined") return;
    window.location.href = upiUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cartItems.length) {
      setError("Your cart is empty. Please add some items first.");
      router.replace("/");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address1.trim()) {
      setError("Please fill name, phone and address.");
      return;
    }

    // require login
    if (!user?.id) {
      // show a friendly prompt and send to login
      alert("Please login before placing order.");
      router.push(`/login?next=/checkout`);
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // keys match what server expects
          customerId: user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: address1.trim(),
          addressLine2: address2.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          paymentMode: paymentMethod, // "COD" | "UPI"
          items: cartItems.map((it) => ({
            id: it.id,
            qty: it.qty,
            mrp: it.mrp,
            product_name: it.product_name,
          })),
        }),
      });

      if (!res.ok) {
        // backend may return JSON or plain text
        const txt = await res.text();
        throw new Error(txt || "Failed to place order");
      }

      const json = await res.json();
      const orderId = json?.orderId;

      // clear cart (local)
      if (typeof window !== "undefined") {
        // depending on your cart key/version — try both common ones
        window.localStorage.setItem("pharmacy_cart_v1", "[]");
        window.localStorage.setItem("pharmacy_cart", "[]");
        window.dispatchEvent(new Event("pharmacy_cart_updated"));
      }

      if (orderId) {
        router.replace(`/orders/${orderId}`);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      console.error("CHECKOUT ERROR:", err);
      // show user-friendly message
      setError(
        typeof err?.message === "string" && err.message
          ? err.message
          : "Server error while placing order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatMoney = (n: number) => `₹${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6">
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 md:space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
              <h2 className="text-sm font-semibold mb-2">Customer</h2>
              {user ? (
                <div className="text-xs md:text-sm text-slate-700 space-y-0.5">
                  <div className="font-medium">{user.name || "Customer"}</div>
                  {user.email && <div>{user.email}</div>}
                  {user.phone && <div>{user.phone}</div>}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-slate-500">
                  You are not logged in. Some details may be missing.
                </p>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-4">
              <h2 className="text-sm font-semibold">Delivery address</h2>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Full name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Phone</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Address line 1</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="House / Flat, Street, Area"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Address line 2 (optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="Landmark, apartment, etc."
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">City</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">State</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Pincode</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-4">
              <h2 className="text-sm font-semibold">Payment mode</h2>

              <label className="flex items-start gap-2 text-xs md:text-sm cursor-pointer">
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-[11px] text-slate-500">Pay in cash when your order is delivered.</div>
                </div>
              </label>

              <label className="flex items-start gap-2 text-xs md:text-sm cursor-pointer">
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === "UPI"} onChange={() => setPaymentMethod("UPI")} />
                <div>
                  <div className="font-medium">UPI (GPay / PhonePe / BHIM)</div>
                  <div className="text-[11px] text-slate-500">Instant payment using any UPI app.</div>
                </div>
              </label>

              {paymentMethod === "UPI" && (
                <div className="mt-2 border rounded-xl bg-emerald-50/40 p-3 md:p-4 flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 text-xs md:text-sm space-y-1">
                    <div className="font-semibold text-slate-700">Business UPI ID</div>
                    <div className="inline-flex items-center rounded-full bg-white border border-emerald-100 px-3 py-1 text-xs font-medium">{BUSINESS_UPI_ID}</div>

                    <button type="button" onClick={handleUPIPayClick} className="mt-2 inline-flex items-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm font-medium px-4 py-1.5">
                      Pay using UPI app&nbsp;
                      <span className="opacity-80">(Amount: {formatMoney(upiAmount)})</span>
                    </button>

                    <p className="mt-1 text-[11px] text-slate-500">After completing the payment in your UPI app, your order will be placed and marked as paid once verified.</p>
                  </div>

                  <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-white rounded-xl border border-emerald-100">
                    {mounted && <QRCodeCanvas value={upiUrl} size={140} includeMargin={true} />}
                  </div>
                </div>
              )}
            </section>

            {error && <p className="text-xs md:text-sm text-red-600">{error}</p>}
          </form>

          <aside className="w-full md:w-80 lg:w-96">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 space-y-3">
              <h2 className="text-sm font-semibold mb-1">Order summary</h2>

              <dl className="text-xs md:text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="font-medium">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Delivery charges</dt>
                  <dd className="font-medium">{formatMoney(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Discount</dt>
                  <dd className="font-medium text-emerald-700">-{formatMoney(discount)}</dd>
                </div>

                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm font-semibold">
                  <dt>Total amount</dt>
                  <dd>{formatMoney(totalAmount)}</dd>
                </div>
              </dl>

              <p className="mt-1 text-[11px] text-slate-500">By placing this order, you agree to receive order updates on SMS / WhatsApp.</p>

              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={placingOrder || !cartItems.length}
                className="w-full mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placingOrder ? "Placing order..." : paymentMethod === "COD" ? "Place order (COD)" : "Place order (UPI)"}
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
