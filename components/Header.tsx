// components/Header.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import {
  CART_OPEN_EVENT,
  CART_UPDATED_EVENT,
  getCartCount,
} from "@/lib/cart";

type NavItem = {
  label: string;
  sectionId: string;
};

const navItems: NavItem[] = [
  { label: "Medicine", sectionId: "popular-medicines" },
  { label: "Lab Tests", sectionId: "lab-tests" },
  { label: "Healthcare", sectionId: "categories" },
  { label: "Offers", sectionId: "hero" },
];

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
};

const USER_KEY = "pharmacy_user";

export default function Header() {
  const router = useRouter();

  const [location, setLocation] = useState("New Delhi");
  const [cartCount, setCartCount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // load saved location, user & initial cart count
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLoc = window.localStorage.getItem("pharmacy_location");
    if (savedLoc && savedLoc.trim()) {
      setLocation(savedLoc);
    }

    setCartCount(getCartCount());

    try {
      const rawUser = window.localStorage.getItem(USER_KEY);
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
    } catch {
      // ignore
    }

    const handleUpdated = () => {
      setCartCount(getCartCount());
    };

    const handleOpen = () => {
      setShowCart(true);
    };

    window.addEventListener(CART_UPDATED_EVENT, handleUpdated);
    window.addEventListener(CART_OPEN_EVENT, handleOpen);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdated);
      window.removeEventListener(CART_OPEN_EVENT, handleOpen);
    };
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChangeLocation = () => {
    if (typeof window === "undefined") return;
    const value = window.prompt(
      "Enter delivery city or pincode",
      location || "New Delhi"
    );
    if (value && value.trim()) {
      const loc = value.trim();
      setLocation(loc);
      window.localStorage.setItem("pharmacy_location", loc);
    }
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleAuthClick = () => {
    if (user?.name) {
      router.push("/checkout");
    } else {
      router.push("/login?next=/checkout");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_KEY);
    }
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  };

  const handleProfile = () => {
    setMenuOpen(false);
    router.push("/profile");
  };

  const handleOrders = () => {
    setMenuOpen(false);
    router.push("/orders");
  };

  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const initial =
    user?.name && user.name.trim().length > 0
      ? user.name.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <>
      <header className="w-full bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg">Pharmacy</div>
              <div className="text-xs text-slate-500">Online Pharmacy</div>
            </div>
          </div>

          {/* Location + Nav */}
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <button
              onClick={handleChangeLocation}
              className="flex items-center text-xs md:text-sm text-slate-700 border rounded-full px-3 py-1 bg-slate-50 hover:bg-slate-100"
            >
              <span className="mr-1 text-base">📍</span>
              <span className="font-semibold mr-1">Deliver to</span>
              <span>{location}</span>
            </button>

            <nav className="flex items-center gap-4 text-sm text-slate-700">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.sectionId)}
                  className="hover:text-emerald-600 whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 lg:hidden" />

          {/* Auth + Cart */}
          <div className="flex items-center gap-3 text-sm">
            {/* User dropdown / login */}
            {user?.name ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="hidden md:inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1.5 border border-emerald-100 hover:bg-emerald-100"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                    {initial}
                  </span>
                  <span className="text-xs md:text-sm font-semibold">
                    Hi, {firstName || "Customer"}
                  </span>
                  <span className="text-[10px] mt-0.5">▼</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 text-xs md:text-sm z-40">
                    <div className="px-4 pb-2 border-b border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        Signed in as
                      </div>
                      <div className="font-semibold text-slate-900">
                        {user.name}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProfile}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-800"
                    >
                      My profile
                    </button>
                    <button
                      type="button"
                      onClick={handleOrders}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-800"
                    >
                      My orders / invoices
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="hidden md:inline-flex px-4 py-1.5 rounded-full border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50"
              >
                Login / Signup
              </button>
            )}

            {/* Cart button */}
            <button
              onClick={handleCartClick}
              className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600"
            >
              Cart ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {/* Global cart popup */}
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}
