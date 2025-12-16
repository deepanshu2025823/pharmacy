// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MedicineGrid from "@/components/MedicineGrid";
import PrescriptionBanner from "@/components/PrescriptionBanner";
import CategorySection from "@/components/CategorySection";
import FeatureSection from "@/components/FeatureSection";
import HomeQuickActions from "@/components/HomeQuickActions";
import LabTestsSection from "@/components/LabTestsSection";
import { mockMedicines, type Medicine } from "@/lib/mockMedicines";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  // --- API + debounced search ---
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
            : "/api/medicines";

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch medicines");

        const json = await res.json();
        if (!ignore) {
          setMedicines(json.data ?? []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          // agar API fail ho jaye to mock data use karo
          setMedicines(mockMedicines);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const timeout = setTimeout(load, 400); // 400ms debounce

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const listToShow: Medicine[] =
    medicines && medicines.length ? medicines : mockMedicines;

  // --- common scroll function (header + bottom nav ke liye similar) ---
  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(sectionId);
    if (!el) return;

    const headerOffset = 72; // approx header height
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;

    window.scrollTo({
      top: rect.top + scrollTop - headerOffset,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pb-16 md:pb-10">
        {/* HERO */}
        <section
          id="hero"
          className="bg-gradient-to-br from-[#ffe8d8] via-[#fff8f0] to-[#e6f7f5]"
        >
          <div className="max-w-6xl mx-auto px-3 pt-5 pb-4 md:py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <h1 className="text-[20px] leading-snug md:text-3xl md:leading-tight font-bold text-slate-900 mb-2">
                  What are you looking for?
                </h1>
                <p className="text-xs md:text-base text-slate-600 mb-4 md:mb-5">
                  Order medicines, book lab tests &amp; shop health products at
                  best prices.
                </p>

                <div className="mb-3">
                  <SearchBar value={query} onChange={setQuery} />
                </div>

                <div className="mt-1 flex flex-wrap gap-2 text-[11px] md:text-xs">
                  {["Diabetes care", "Heart", "Antibiotics", "Baby care"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:bg-slate-50"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Right side hero banner */}
              <div className="w-full max-w-xs sm:max-w-sm lg:w-80 xl:w-96">
                <div className="w-full rounded-3xl bg-[linear-gradient(135deg,#10847E,#35b0a0)] text-white p-4 md:p-5 shadow-md">
                  <p className="text-[10px] md:text-xs uppercase tracking-wide mb-1 opacity-80">
                    No.1 style online pharmacy
                  </p>
                  <p className="text-sm md:text-base font-semibold mb-2">
                    Safe, genuine medicines delivered to your doorstep.
                  </p>
                  <ul className="text-[10px] md:text-[11px] space-y-1 opacity-90">
                    <li>• 24x7 ordering</li>
                    <li>• Superfast delivery*</li>
                    <li>• Great offers &amp; savings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTION CARDS */}
        <HomeQuickActions />

        {/* OFFER STRIP */}
        <section className="max-w-6xl mx-auto px-3 mt-5 grid gap-3 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-3 text-xs md:text-sm flex items-center gap-2">
            <span className="text-pink-500 text-lg">💊</span>
            <div>
              <div className="font-semibold">Flat 18% OFF</div>
              <div className="text-[11px] text-slate-500">
                on prescription medicines
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-xs md:text-sm flex items-center gap-2">
            <span className="text-green-500 text-lg">🧪</span>
            <div>
              <div className="font-semibold">Up to 70% OFF</div>
              <div className="text-[11px] text-slate-500">on lab tests</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-xs md:text-sm flex items-center gap-2">
            <span className="text-yellow-500 text-lg">🚚</span>
            <div>
              <div className="font-semibold">Free delivery</div>
              <div className="text-[11px] text-slate-500">above ₹500</div>
            </div>
          </div>
        </section>

        {/* UPLOAD PRESCRIPTION (ab backend se dynamic) */}
        <PrescriptionBanner />

        {/* LAB TESTS */}
        <section id="lab-tests">
          <LabTestsSection />
        </section>

        {/* CATEGORIES */}
        <section id="categories">
          <CategorySection />
        </section>

        {/* POPULAR MEDICINES */}
        <section id="popular-medicines" className="mt-8">
          <div className="max-w-6xl mx-auto px-3 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Popular Medicines</h2>
            <span className="text-xs text-slate-500">
              {loading
                ? "Loading..."
                : `Showing ${listToShow.length} item${
                    listToShow.length === 1 ? "" : "s"
                  }`}
            </span>
          </div>
          <MedicineGrid medicines={listToShow} />
        </section>

        {/* WHY CHOOSE + APP DOWNLOAD */}
        <FeatureSection />

        {/* MOBILE BOTTOM NAV (only on small screens) */}
        <MobileBottomNav onNavigate={scrollToSection} />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-3 py-5 grid gap-4 md:grid-cols-3">
          <div id="about">
            <div className="font-semibold mb-1">Pharmacy</div>
            <p className="text-[11px] text-slate-400">
              Your trusted online pharmacy for genuine medicines, health
              products and lab tests.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1">Company</div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <a href="#about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">Need help</div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <a href="#popular-medicines" className="hover:text-white">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#popular-medicines" className="hover:text-white">
                  Returns &amp; Refunds
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700">
          <div className="max-w-6xl mx-auto px-3 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
            <span>
              © {new Date().getFullYear()} Pharmacy. All rights reserved.
            </span>
            <span className="text-[11px] text-slate-400">
              Design &amp; Developed By Deepanshu Joshi
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --------- Mobile Bottom Navigation (only used in this file) ---------- */

type MobileNavProps = {
  onNavigate: (sectionId: string) => void;
};

function MobileBottomNav({ onNavigate }: MobileNavProps) {
  const items = [
    { id: "hero", label: "Home", icon: "🏠" },
    { id: "popular-medicines", label: "Medicines", icon: "💊" },
    { id: "lab-tests", label: "Lab Tests", icon: "🧪" },
    { id: "categories", label: "Health", icon: "❤️" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(15,23,42,0.08)] md:hidden z-40">
      <div className="max-w-6xl mx-auto px-3 py-1 flex justify-between">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 py-1"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-medium text-slate-700">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
