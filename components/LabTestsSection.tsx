"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LabTest = {
  id: number;
  name: string;
  short_description: string;
  concern: string;
  price: number;
  offer_price: number;
  tests_count: number | null;
  fasting_required: boolean;
};

export default function LabTestsSection() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          "/api/lab-tests?popular=1&limit=6",
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Failed to load lab tests");

        const json = await res.json();
        setTests(json.data ?? []);
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

  const listToShow =
    tests.length > 0
      ? tests
      : [
          {
            id: 1,
            name: "Full Body Checkup",
            short_description: "75+ tests including CBC, LFT, KFT",
            concern: "Full Body",
            price: 2499,
            offer_price: 899,
            tests_count: 75,
            fasting_required: true,
          },
          {
            id: 2,
            name: "Diabetes Screening",
            short_description: "Fasting blood sugar, HbA1c & more",
            concern: "Diabetes",
            price: 1299,
            offer_price: 499,
            tests_count: 12,
            fasting_required: true,
          },
          {
            id: 3,
            name: "Heart Health Package",
            short_description: "Cholesterol profile & heart markers",
            concern: "Heart",
            price: 2999,
            offer_price: 1199,
            tests_count: 18,
            fasting_required: false,
          },
        ];

  return (
    <section className="max-w-6xl mx-auto px-3 mt-8">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="font-semibold text-lg">Lab tests by health concern</h2>
        <Link
          href="/lab-tests"
          className="text-xs md:text-sm text-emerald-600 font-semibold hover:underline"
        >
          View All &gt;
        </Link>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {listToShow.map((test) => {
          const discount = Math.round(
            (1 - test.offer_price / (test.price || 1)) * 100
          );

          return (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col justify-between"
            >
              <div className="mb-2">
                <div className="text-[11px] text-slate-500 mb-0.5">
                  {test.concern || "Health Package"}
                </div>
                <div className="font-semibold text-xs md:text-sm mb-1 line-clamp-2">
                  {test.name}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {test.short_description}
                </p>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                {test.tests_count && (
                  <div>{test.tests_count}+ tests included</div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-emerald-700">
                    ₹{test.offer_price.toFixed(2)}
                  </span>
                  <span className="line-through text-slate-400">
                    ₹{test.price.toFixed(2)}
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {discount}% OFF
                  </span>
                </div>
                {test.fasting_required && (
                  <div className="text-[10px] text-orange-500 font-medium">
                    Fasting required
                  </div>
                )}
              </div>

              <Link
                href="/lab-tests"
                className="mt-2 w-full py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold text-center hover:bg-emerald-700"
              >
                Book now
              </Link>
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="mt-2 text-[11px] text-slate-400">
          Loading lab tests…
        </p>
      )}
    </section>
  );
}
