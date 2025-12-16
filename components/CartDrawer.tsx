"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  readCart,
  updateCartItemQty,
  removeFromCart,
  CART_UPDATED_EVENT,
  type CartItem,
} from "@/lib/cart";

type Props = {
  open: boolean;
  onClose: () => void;
};

const USER_KEY = "pharmacy_user";

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  // refresh cart when drawer opens or cart updates
  useEffect(() => {
    if (!open) return;
    setItems(readCart());

    const handler = () => {
      setItems(readCart());
    };

    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handler);
    };
  }, [open]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.mrp * item.qty, 0),
    [items]
  );

  const handleCheckout = () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(USER_KEY);

    onClose();

    if (!raw) {
      // new user → go to register first
      router.push("/register?next=/checkout");
    } else {
      // already logged in
      router.push("/checkout");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* overlay */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* drawer */}
      <div className="w-full max-w-sm bg-white h-full shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-base">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              Your cart is empty.
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 border border-slate-100 rounded-xl p-3"
            >
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">No image</span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold line-clamp-2">
                    {item.product_name}
                  </div>
                  <div className="text-xs text-emerald-600 font-bold mt-1">
                    ₹{item.mrp.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQty(item.id, Math.max(1, item.qty - 1))
                      }
                      className="w-7 h-7 flex items-center justify-center text-sm hover:bg-slate-100"
                    >
                      −
                    </button>
                    <div className="w-8 text-center text-xs font-semibold">
                      {item.qty}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCartItemQty(item.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-sm hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[11px] text-slate-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* footer summary */}
        <div className="border-t px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Items
            </span>
            <span className="font-semibold text-slate-900">
              {items.reduce((sum, i) => sum + i.qty, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold text-slate-900">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full mt-1 rounded-xl bg-emerald-600 text-white text-sm font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
