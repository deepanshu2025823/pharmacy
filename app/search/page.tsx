// app/search/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicineCard from "@/components/MedicineCard";
import type { Medicine } from "@/lib/mockMedicines";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setMedicines([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/medicines?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setMedicines(data.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300">
                <span className="pl-4 text-2xl">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, health products, etc."
                  className="flex-1 px-3 py-3.5 text-sm md:text-base bg-transparent outline-none text-slate-900 placeholder-slate-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="mr-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            {query && (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    Search Results
                  </h1>
                  <p className="text-sm text-slate-600">
                    Showing results for:{" "}
                    <span className="font-semibold text-teal-600">"{query}"</span>
                  </p>
                </div>
                {!loading && medicines.length > 0 && (
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-slate-200">
                    <span className="text-lg">📦</span>
                    <span className="text-sm">
                      <span className="font-bold text-teal-600 text-lg">
                        {medicines.length}
                      </span>
                      <span className="text-slate-600 ml-1">
                        {medicines.length === 1 ? "Result" : "Results"}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">Searching for medicines...</p>
            </div>
          ) : medicines.length > 0 ? (
            /* Results Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          ) : query ? (
            /* No Results */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No results found
              </h2>
              <p className="text-slate-600 mb-6 text-center max-w-md">
                We couldn't find any medicines matching "{query}". Try searching
                with different keywords.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Home
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-6">💊</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Start Searching
              </h2>
              <p className="text-slate-600 text-center max-w-md">
                Enter a medicine name or health product to search
              </p>
            </div>
          )}

          {/* Popular Searches */}
          {!loading && medicines.length === 0 && query && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Paracetamol",
                  "Dolo 650",
                  "Azithromycin",
                  "Vitamin D",
                  "Omeprazole",
                  "Metformin",
                  "Aspirin",
                  "Amoxicillin",
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                    className="px-4 py-2 bg-white border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 rounded-full text-sm font-medium text-slate-700 hover:text-teal-700 transition-all duration-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer stats={null} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}