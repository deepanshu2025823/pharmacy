// components/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Medicine } from "@/lib/mockMedicines";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch search results
  useEffect(() => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/medicines?q=${encodeURIComponent(value.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleProductClick = (productId: number) => {
    setShowDropdown(false);
    onChange("");
    router.push(`/product/${productId}`);
  };

  const handleViewAllResults = () => {
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="relative w-full z-[9999]" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300">
          <span className="pl-4 text-2xl">🔍</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => value.trim() && searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search medicines, health products, etc."
            className="flex-1 px-3 py-3.5 text-sm md:text-base bg-transparent outline-none text-slate-900 placeholder-slate-400"
          />
          <button
            type="submit"
            className="mr-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
          >
            Search
          </button>
        </div>
      </form>

      {/* Dropdown Results */}
      {showDropdown && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[500px] overflow-y-auto z-[9999]"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {loading ? (
            <div className="p-6 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-600">Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={handleViewAllResults}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    View All →
                  </button>
                </div>
              </div>

              <div className="py-2">
                {searchResults.map((medicine) => (
                  <button
                    key={medicine.id}
                    onClick={() => handleProductClick(medicine.id)}
                    className="w-full px-4 py-3 hover:bg-teal-50 transition-colors duration-200 flex items-start gap-3 group"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {medicine.image_url ? (
                        <img
                          src={medicine.image_url}
                          alt={medicine.product_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl">💊</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors leading-tight mb-1">
                        {medicine.product_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mb-1">
                        {medicine.manufacturer || medicine.marketer}
                      </p>
                      {medicine.package && (
                        <p className="text-xs text-slate-600 truncate">
                          {medicine.package}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <div className="font-bold text-base text-teal-600">
                        ₹{medicine.mrp?.toFixed(2)}
                      </div>
                      {medicine.mrp && (
                        <div className="text-xs text-green-600 font-semibold">
                          18% OFF
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleViewAllResults}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm shadow-md hover:shadow-lg"
                >
                  View All Results for "{value}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-slate-600 mb-1">No results found</p>
              <p className="text-xs text-slate-500">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}