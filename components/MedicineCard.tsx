// components/MedicineCard.tsx
"use client";

import Link from "next/link";
import type { Medicine } from "@/lib/mockMedicines";
import { addToCart } from "@/lib/cart";

type Props = {
  medicine: Medicine;
};

export default function MedicineCard({ medicine }: Props) {
  const discount = 18;

  const handleAddToCart = () => {
    addToCart(
      {
        id: medicine.id,
        product_name: medicine.product_name,
        mrp: medicine.mrp,
        image_url: medicine.image_url,
      },
      1
    );
  };

  const originalMrp = (medicine.mrp * (1 + discount / 100)).toFixed(2);
  const savedAmount = (medicine.mrp * (discount / 100)).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {/* Discount Badge */}
      <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10">
        {discount}% OFF
      </div>

      {/* Prescription Badge */}
      {medicine.prescription_required === "Yes" && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10">
          ℞ Rx
        </div>
      )}

      {/* Image */}
      <Link href={`/product/${medicine.id}`}>
        <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-teal-50/30 p-3 flex items-center justify-center overflow-hidden">
          {medicine.image_url ? (
            <img
              src={medicine.image_url}
              alt={medicine.product_name}
              className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-5xl">💊</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/product/${medicine.id}`}>
          <h3 className="font-bold text-xs leading-tight mb-1.5 line-clamp-2 min-h-[32px] group-hover:text-teal-600 transition-colors">
            {medicine.product_name}
          </h3>
        </Link>

        {/* Manufacturer */}
        <p className="text-[10px] text-slate-500 mb-2 truncate">
          {medicine.manufacturer || medicine.marketer}
        </p>

        {/* Package Info */}
        {medicine.package && (
          <p className="text-[10px] text-slate-600 mb-3 truncate font-medium">
            {medicine.package}
          </p>
        )}

        {/* Price Section - Pushed to bottom */}
        <div className="mt-auto">
          <div className="bg-gradient-to-r from-slate-50 to-teal-50 p-2.5 rounded-xl mb-2.5">
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-lg font-bold text-teal-600">
                ₹{medicine.mrp?.toFixed(2) || "0.00"}
              </span>
              {medicine.mrp && (
                <span className="text-[10px] text-slate-400 line-through">
                  ₹{originalMrp}
                </span>
              )}
            </div>
            {medicine.mrp && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                  Save ₹{savedAmount}
                </span>
                <span className="text-[9px] text-slate-500">
                  ({discount}% off)
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-1.5 text-xs group/btn"
          >
            <svg
              className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}