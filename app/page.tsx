// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import PrescriptionBanner from "@/components/PrescriptionBanner";
import CategorySection from "@/components/CategorySection";
import FeatureSection from "@/components/FeatureSection";
import HomeQuickActions from "@/components/HomeQuickActions";
import LabTestsSection from "@/components/LabTestsSection";
import Footer from "@/components/Footer";
import MedicineCard from "@/components/MedicineCard";
import { mockMedicines, type Medicine } from "@/lib/mockMedicines";

interface Notification {
  id: number;
  message: string;
  link: string | null;
  created_at: string;
}

interface DashboardStats {
  totalMedicines: number;
  totalLabTests: number;
  totalOrders: number;
  totalCustomers: number;
  recentOrders: number;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  // Debounced search for medicines
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());

        const url =
          params.toString().length > 0
            ? `/api/medicines?${params.toString()}`
            : "/api/medicines?limit=12";

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch medicines");

        const json = await res.json();
        if (!ignore) {
          setMedicines(json.data ?? []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setMedicines(mockMedicines);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const timeout = setTimeout(load, 400);

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const listToShow: Medicine[] =
    medicines && medicines.length ? medicines : mockMedicines;

  // Get total count from API
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const res = await fetch("/api/medicines/count");
        if (res.ok) {
          const data = await res.json();
          setTotalCount(data.total || 0);
        } else {
          // Fallback to medicines length if API fails
          setTotalCount(listToShow.length);
        }
      } catch (err) {
        console.error("Failed to fetch total count:", err);
        // Fallback to medicines length
        setTotalCount(listToShow.length);
      }
    };
    fetchTotalCount();
  }, [listToShow.length]);

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(sectionId);
    if (!el) return;

    const headerOffset = 72;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;

    window.scrollTo({
      top: rect.top + scrollTop - headerOffset,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="flex-1 pb-16 md:pb-10">
        {/* HERO SECTION */}
        <section
          id="hero"
          className="relative bg-gradient-to-br from-[#e0f2f1] via-[#f0f9ff] to-[#fce7f3]"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-teal-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-3 pt-8 pb-6 md:pt-12 md:pb-10">
            {/* Notification Banner */}
            {notifications.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">🔔</span>
                    <p className="text-xs md:text-sm font-medium truncate">
                      {notifications[0].message}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                  >
                    View All
                  </button>
                </div>
                {showNotifications && notifications.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                    {notifications.slice(1).map((notif) => (
                      <p key={notif.id} className="text-xs opacity-90">
                        • {notif.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-teal-700 mb-3 shadow-sm">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                  Trusted by 50,000+ customers
                </div>

                <h1 className="text-2xl leading-tight md:text-4xl md:leading-tight font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-teal-700 bg-clip-text text-transparent">
                  Your Health, Our Priority
                </h1>
                <p className="text-sm md:text-lg text-slate-600 mb-5 md:mb-6 font-medium">
                  Order medicines, book lab tests & shop health products at
                  unbeatable prices
                </p>

                <div className="mb-4 relative z-50">
                  <SearchBar value={query} onChange={setQuery} />
                </div>

                <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                  {[
                    { label: "Diabetes Care", icon: "💉" },
                    { label: "Heart Health", icon: "❤️" },
                    { label: "Antibiotics", icon: "💊" },
                    { label: "Baby Care", icon: "👶" },
                  ].map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => setQuery(tag.label)}
                      className="group px-4 py-2 rounded-full bg-white border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <span className="mr-1.5">{tag.icon}</span>
                      <span className="group-hover:text-teal-700 font-medium">
                        {tag.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Card */}
              <div className="w-full max-w-xs sm:max-w-sm lg:w-96 xl:w-[420px]">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#14b8a6] text-white p-5 md:p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs md:text-sm uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
                        #1 Online Pharmacy
                      </span>
                      <span className="text-2xl">⭐</span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold mb-2">
                      Safe & Genuine Medicines
                    </h3>
                    <p className="text-xs md:text-sm opacity-90 mb-4">
                      Delivered right to your doorstep with care
                    </p>

                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                        <span>⚡</span>
                        <span>24x7 Ordering Available</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                        <span>🚀</span>
                        <span>Express Delivery*</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                        <span>💰</span>
                        <span>Best Prices & Offers</span>
                      </div>
                    </div>

                    {stats && (
                      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-bold text-lg">
                            {stats.totalMedicines.toLocaleString()}+
                          </div>
                          <div className="opacity-80">Medicines</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {stats.totalOrders.toLocaleString()}+
                          </div>
                          <div className="opacity-80">Orders</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <div className="mt-6">
          <HomeQuickActions />
        </div>

        {/* DYNAMIC OFFERS STRIP */}
        <section className="max-w-6xl mx-auto px-3 mt-6 grid gap-3 md:grid-cols-3">
          <div className="group bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-md hover:shadow-xl p-4 transition-all duration-300 border border-pink-100">
            <div className="flex items-start gap-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                💊
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm md:text-base">
                  Flat 18% OFF
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  On prescription medicines
                </div>
                {stats && (
                  <div className="text-xs text-pink-600 font-semibold mt-2">
                    {stats.totalMedicines}+ medicines available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md hover:shadow-xl p-4 transition-all duration-300 border border-green-100">
            <div className="flex items-start gap-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                🧪
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm md:text-base">
                  Up to 70% OFF
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  On lab tests
                </div>
                {stats && (
                  <div className="text-xs text-green-600 font-semibold mt-2">
                    {stats.totalLabTests}+ tests available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-md hover:shadow-xl p-4 transition-all duration-300 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                🚚
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm md:text-base">
                  Free Delivery
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  On orders above ₹500
                </div>
                {stats && stats.recentOrders > 0 && (
                  <div className="text-xs text-amber-600 font-semibold mt-2">
                    {stats.recentOrders} orders today
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* UPLOAD PRESCRIPTION */}
        <div className="mt-6">
          <PrescriptionBanner />
        </div>

        {/* LAB TESTS */}
        <section id="lab-tests" className="mt-8">
          <LabTestsSection />
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="mt-8">
          <CategorySection />
        </section>

        {/* POPULAR MEDICINES - Fixed 6 Column Grid */}
        <section id="popular-medicines" className="mt-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header - Left & Right Layout */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              {/* Left Side */}
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-full mb-3 border border-teal-200">
                  <span className="text-2xl">💊</span>
                  <span className="text-sm font-semibold text-teal-700">
                    Bestsellers
                  </span>
                </div>
                <h2 className="font-bold text-3xl md:text-4xl text-slate-900 mb-2">
                  Popular Medicines
                </h2>
                <p className="text-base text-slate-600">
                  Trusted by thousands of customers • Best prices guaranteed
                </p>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading medicines...
                  </div>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-md border border-slate-200">
                      <span className="text-lg"></span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-teal-600 text-sm">
                          {totalCount > 0 ? totalCount.toLocaleString() : listToShow.length}
                        </span>
                        <span className="text-slate-600 text-sm">
                          + Products
                        </span>
                      </div>
                    </div>
                    <button className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm whitespace-nowrap">
                      <span>View All</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 6 Column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {listToShow.slice(0, 12).map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="font-bold text-slate-900 text-sm">
                    100% Genuine
                  </div>
                  <div className="text-xs text-slate-500">Authentic Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🚚</div>
                  <div className="font-bold text-slate-900 text-sm">
                    Fast Delivery
                  </div>
                  <div className="text-xs text-slate-500">Within 24-48 Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold text-slate-900 text-sm">
                    Best Prices
                  </div>
                  <div className="text-xs text-slate-500">Lowest in Market</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔒</div>
                  <div className="font-bold text-slate-900 text-sm">
                    Secure Payment
                  </div>
                  <div className="text-xs text-slate-500">100% Safe</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES & APP DOWNLOAD */}
        <div className="mt-12">
          <FeatureSection />
        </div>

        {/* MOBILE BOTTOM NAV */}
        <MobileBottomNav onNavigate={scrollToSection} />
      </main>

      <Footer stats={stats} />
    </div>
  );
}

/* Mobile Bottom Navigation */
type MobileNavProps = {
  onNavigate: (sectionId: string) => void;
};

function MobileBottomNav({ onNavigate }: MobileNavProps) {
  const [active, setActive] = useState("hero");

  const items = [
    { id: "hero", label: "Home", icon: "🏠" },
    { id: "popular-medicines", label: "Medicines", icon: "💊" },
    { id: "lab-tests", label: "Lab Tests", icon: "🧪" },
    { id: "categories", label: "Health", icon: "❤️" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.1)] md:hidden z-40">
      <div className="max-w-6xl mx-auto px-3 py-2 flex justify-between">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActive(item.id);
              onNavigate(item.id);
            }}
            className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-all duration-200 ${
              active === item.id ? "scale-110" : ""
            }`}
          >
            <span
              className={`text-xl transition-transform ${
                active === item.id ? "scale-125" : ""
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                active === item.id
                  ? "text-teal-600 font-semibold"
                  : "text-slate-600"
              }`}
            >
              {item.label}
            </span>
            {active === item.id && (
              <div className="w-1 h-1 bg-teal-500 rounded-full mt-0.5"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}