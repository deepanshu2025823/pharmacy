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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col hover:shadow-md transition-shadow relative">
      {/* Image */}
      <Link href={`/product/${medicine.id}`}>
        <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
          {medicine.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={medicine.image_url}
              alt={medicine.product_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-slate-400 text-sm">No Image</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1">
        <Link href={`/product/${medicine.id}`}>
          <h3 className="font-semibold text-xs mb-1 line-clamp-2 hover:text-emerald-600">
            {medicine.product_name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mb-2">{medicine.marketer}</p>
        <p className="text-xs text-slate-500">
          {medicine.product_form} • {medicine.package} of {medicine.qty}
        </p>
      </div>

      {/* Price + Add to cart */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base">
              ₹{medicine.mrp.toFixed(2)}
            </span>
            <span className="text-xs line-through text-slate-400">
              ₹{originalMrp}
            </span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            {discount}% OFF
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
