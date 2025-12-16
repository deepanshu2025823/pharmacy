"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Header from "@/components/Header";

type LabTest = {
  id: number;
  name: string;
  short_description: string;
  concern: string;
  price: number;
  offer_price: number;
  tests_count?: number | null;
  fasting_required?: boolean;
};

type SortOption = "relevance" | "price_asc" | "price_desc";

export default function LabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [fastingOnly, setFastingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBooking, setShowBooking] = useState(false);

  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // --------- Load all lab tests from API ----------
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/lab-tests?limit=50", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load lab tests");

        const json = await res.json();
        const data: any[] = json.data || [];

        const mapped: LabTest[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          short_description: t.short_description || "",
          concern: t.concern || "",
          price: Number(t.price ?? 0),
          offer_price: Number(t.offer_price ?? 0),
          tests_count: t.tests_count ?? null,
          fasting_required: !!t.fasting_required,
        }));

        setTests(mapped);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setError("Unable to load lab tests right now.");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, []);

  // Unique concerns for filters
  const concernOptions = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      if (t.concern) set.add(t.concern);
    });
    return Array.from(set);
  }, [tests]);

  // Filtered + sorted list
  const filteredTests = useMemo(() => {
    let list = [...tests];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.short_description || "").toLowerCase().includes(q) ||
          (t.concern || "").toLowerCase().includes(q)
      );
    }

    if (selectedConcerns.length > 0) {
      list = list.filter((t) => selectedConcerns.includes(t.concern));
    }

    if (fastingOnly) {
      list = list.filter((t) => t.fasting_required);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.offer_price - b.offer_price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.offer_price - a.offer_price);
    }

    return list;
  }, [tests, query, selectedConcerns, fastingOnly, sortBy]);

  const selectedTests = useMemo(
    () => tests.filter((t) => selectedIds.includes(t.id)),
    [tests, selectedIds]
  );

  const selectedTotal = useMemo(
    () => selectedTests.reduce((sum, t) => sum + t.offer_price, 0),
    [selectedTests]
  );

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const toggleSelectTest = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleOpenBooking = () => {
    if (selectedTests.length === 0) return;
    setBookingMessage("");
    setShowBooking(true);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookingPhone.trim() || !bookingDate.trim()) {
      setBookingMessage("Please enter mobile number and preferred date.");
      return;
    }

    setBookingSubmitting(true);

    try {
      const raw =
        (typeof window !== "undefined" &&
          window.localStorage.getItem("pharmacy_lab_orders")) || "[]";
      const arr = JSON.parse(raw);
      const order = {
        id: Date.now(),
        name: bookingName.trim() || "Guest",
        phone: bookingPhone.trim(),
        date: bookingDate.trim(),
        tests: selectedTests,
        created_at: new Date().toISOString(),
      };
      if (Array.isArray(arr)) arr.push(order);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "pharmacy_lab_orders",
          JSON.stringify(arr)
        );
      }

      setBookingMessage("Your lab test booking request has been saved.");
      setSelectedIds([]);
      setBookingName("");
      setBookingPhone("");
      setBookingDate("");
      setTimeout(() => setShowBooking(false), 1500);
    } catch (err) {
      console.error(err);
      setBookingMessage("Something went wrong. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO / FILTER BAR */}
        <section className="bg-gradient-to-br from-[#e6f7f5] via-white to-[#fff8f0] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-3 py-4 md:py-6">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              Lab tests &amp; health packages
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mb-3">
              Book lab tests from certified labs with free home sample
              collection.
            </p>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tests by name, condition or health concern"
                  className="w-full h-10 md:h-11 rounded-full border border-slate-200 bg-white px-4 text-xs md:text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] md:text-xs">
                <span className="text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as SortOption)
                  }
                  className="border border-slate-200 rounded-full px-3 py-1 bg-white outline-none text-xs"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* main content */}
        <section className="max-w-6xl mx-auto px-3 py-5 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-5">
          {/* LEFT FILTERS */}
          <aside className="bg-white rounded-2xl border border-slate-100 p-3 md:p-4 h-max">
            <h2 className="font-semibold text-sm mb-2">Filters</h2>

            <div className="mb-3">
              <div className="text-[11px] text-slate-500 mb-1">
                Health concern
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {concernOptions.length === 0 && (
                  <div className="text-[11px] text-slate-400">
                    No concerns found yet.
                  </div>
                )}
                {concernOptions.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 text-[11px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConcerns.includes(c)}
                      onChange={() => toggleConcern(c)}
                      className="w-3 h-3"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastingOnly}
                  onChange={() => setFastingOnly((v) => !v)}
                  className="w-3 h-3"
                />
                <span>Fasting required only</span>
              </label>
            </div>

            <div className="border-t border-slate-100 pt-2 mt-2 flex flex-wrap gap-2">
              <button
                className="text-[11px] text-emerald-600 font-semibold hover:underline"
                onClick={() => {
                  setSelectedConcerns([]);
                  setFastingOnly(false);
                }}
              >
                Clear filters
              </button>
            </div>
          </aside>

          {/* RIGHT LIST */}
          <div>
            <div className="flex items-center justify-between mb-2 text-[11px] md:text-xs text-slate-500">
              <div>
                {loading
                  ? "Loading lab tests..."
                  : `Showing ${filteredTests.length} of ${tests.length} tests`}
              </div>
              <div className="hidden md:flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <span>
                      Selected:{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedIds.length}
                      </span>
                    </span>
                    <button
                      onClick={handleClearSelection}
                      className="text-[11px] text-emerald-600 hover:underline"
                    >
                      Clear selection
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-2">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTests.map((test) => {
                const discount = Math.round(
                  (1 - test.offer_price / (test.price || 1)) * 100
                );
                const checked = selectedIds.includes(test.id);

                return (
                  <label
                    key={test.id}
                    className="bg-white rounded-2xl border border-slate-100 p-3 md:p-4 text-xs flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelectTest(test.id)}
                        className="mt-1 w-3 h-3"
                      />
                      <div className="flex-1">
                        <div className="text-[11px] text-slate-500 mb-0.5">
                          {test.concern || "Health Package"}
                        </div>
                        <div className="font-semibold text-sm mb-1 line-clamp-2">
                          {test.name}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {test.short_description}
                        </p>
                        {test.tests_count && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            {test.tests_count}+ tests included
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-bold text-emerald-700">
                        ₹{test.offer_price.toFixed(2)}
                      </span>
                      <span className="text-[11px] line-through text-slate-400">
                        ₹{test.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        {discount}% OFF
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {test.fasting_required && (
                        <span className="text-[10px] text-orange-500 font-medium">
                          Fasting required
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!checked) {
                            toggleSelectTest(test.id);
                          }
                          setShowBooking(true);
                        }}
                        className="ml-auto text-[11px] px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50"
                      >
                        Book now
                      </button>
                    </div>
                  </label>
                );
              })}

              {!loading && filteredTests.length === 0 && (
                <div className="col-span-full text-xs text-slate-500">
                  No lab tests found for the selected filters.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* STICKY BOTTOM SUMMARY */}
      {selectedTests.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40">
          <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between gap-3 text-xs md:text-sm">
            <div>
              <div className="font-semibold text-slate-800">
                {selectedTests.length} test
                {selectedTests.length > 1 ? "s" : ""} selected
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1">
                {selectedTests.map((t) => t.name).join(", ")}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-500">
                  Total price
                </div>
                <div className="font-semibold text-emerald-700">
                  ₹{selectedTotal.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleOpenBooking}
                className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] md:text-xs font-semibold hover:bg-emerald-700"
              >
                Proceed to book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowBooking(false)}
          />
          <div className="w-full max-w-md bg-white h-full md:h-auto md:my-8 md:rounded-2xl shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                Book lab tests
              </h2>
              <button
                onClick={() => setShowBooking(false)}
                className="text-xs px-2 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 text-xs space-y-3">
              <div>
                <div className="font-semibold mb-1">
                  Selected tests ({selectedTests.length})
                </div>
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {selectedTests.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="line-clamp-1">{t.name}</span>
                      <span className="font-semibold text-emerald-700">
                        ₹{t.offer_price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-1 text-[11px] text-slate-600">
                  Total payable:{" "}
                  <span className="font-semibold text-emerald-700">
                    ₹{selectedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleBookingSubmit}
                className="space-y-2 border-t border-slate-100 pt-2 mt-1"
              >
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Optional"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600">
                    Mobile number *
                  </label>
                  <input
                    type="tel"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="e.g. 98xxxxxx"
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600">
                    Preferred date *
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-500">
                  Our team will call you to confirm your slot and address
                  for home sample collection.
                </div>

                {bookingMessage && (
                  <div className="text-[11px] text-emerald-700">
                    {bookingMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingSubmitting || selectedTests.length === 0}
                  className="w-full mt-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {bookingSubmitting
                    ? "Submitting..."
                    : "Confirm booking request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
