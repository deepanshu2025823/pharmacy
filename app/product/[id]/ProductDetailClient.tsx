"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  Product,
  RelatedProduct,
  ProductReview,
} from "./page";
import { addToCart } from "@/lib/cart";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  product: Product;
  relatedRecent: RelatedProduct[];
  crossSelling: RelatedProduct[];
  initialReviews: ProductReview[];
};

type LabTest = {
  id: number;
  name: string;
  short_description: string;
  concern: string;
  price: number;
  offer_price: number;
};

export default function ProductDetailClient({
  product,
  relatedRecent,
  crossSelling,
  initialReviews,
}: Props) {
  const router = useRouter();

  const [cartQty, setCartQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "usage" | "safety">(
    "overview"
  );

  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews || []);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // rating summary
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount;

  // Frequently bought together
  const fbtProducts: RelatedProduct[] = [
    {
      id: product.id,
      product_name: product.product_name,
      mrp: product.mrp,
      image_url: product.image_url,
    },
    ...crossSelling.slice(0, 2),
  ];
  const [selectedFbtIds, setSelectedFbtIds] = useState<number[]>(
    fbtProducts.map((p) => p.id)
  );

  const fbtTotal = fbtProducts
    .filter((p) => selectedFbtIds.includes(p.id))
    .reduce((sum, p) => sum + p.mrp, 0);

  const toggleFbt = (id: number) => {
    setSelectedFbtIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddFbtToCart = () => {
    fbtProducts
      .filter((p) => selectedFbtIds.includes(p.id))
      .forEach((p) =>
        addToCart(
          {
            id: p.id,
            product_name: p.product_name,
            mrp: p.mrp,
            image_url: p.image_url,
          },
          1
        )
      );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Quantity + add to cart
  const decreaseQty = () => {
    setCartQty((q) => (q > 1 ? q - 1 : 1));
  };

  const increaseQty = () => {
    setCartQty((q) => q + 1);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        product_name: product.product_name,
        mrp: product.mrp,
        image_url: product.image_url,
      },
      cartQty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountMrp = (product.mrp * 1.18).toFixed(2); // approx 18% OFF

  const isPrescription =
    /tablet|capsule|injection|syrup|drop/i.test(product.product_form || "") ||
    /tab|cap|inj/i.test(product.product_name);

  // ---------- Related Lab Tests (dynamic from API) ----------
  const [labTests, setLabTests] = useState<LabTest[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/lab-tests?limit=3&popular=1", {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to load lab tests");

        const json = await res.json();
        const data = (json.data || []) as any[];

        const mapped: LabTest[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          short_description: t.short_description || "",
          concern: t.concern || "",
          price: Number(t.price ?? 0),
          offer_price: Number(t.offer_price ?? 0),
        }));

        setLabTests(mapped);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Related lab tests error", err);
        setLabTests([]); // silent fail, UI optional
      }
    };

    load();

    return () => controller.abort();
  }, [product.id]);

  // ---------- Review submit ----------
  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewRating || !reviewComment.trim()) {
      setReviewError("Please give a rating and write a short review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          name: reviewName.trim() || "Anonymous",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save review");
      }

      const json = await res.json();
      if (json.data) {
        setReviews((prev) => [json.data as ProductReview, ...prev]);
      }

      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      console.error(err);
      setReviewError("Could not save your review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="text-[11px] md:text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / <span>Medicines</span> /{" "}
          <span className="text-slate-700">{product.product_name}</span>
        </div>

        {/* Top section: image + summary */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Left: Image + trust badges */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-md p-4 md:p-6 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-contain max-h-[360px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] md:text-xs">
              <TrustBadge icon="✅" label="100% genuine medicines" />
              <TrustBadge icon="🚚" label="Superfast delivery*" />
              <TrustBadge icon="💳" label="Secure payments" />
              <TrustBadge icon="📞" label="24x7 support" />
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-4 md:space-y-5">
            {/* Title + manufacturer */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">
                {product.product_name}
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                {product.marketer}
              </p>

              {/* Rating summary just above price */}
              <div className="mt-1 flex items-center gap-2 text-xs md:text-sm">
                {reviewCount > 0 ? (
                  <>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                      <span className="font-semibold">
                        {avgRating.toFixed(1)}
                      </span>
                      <span>★</span>
                    </div>
                    <span className="text-[11px] md:text-xs text-slate-500">
                      {reviewCount}{" "}
                      {reviewCount === 1 ? "rating" : "ratings"}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    No ratings yet
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isPrescription && (
                  <span className="text-[10px] md:text-[11px] px-2 py-1 rounded-full bg-red-50 text-red-600 font-semibold border border-red-100">
                    Rx – Prescription required
                  </span>
                )}
                <span className="text-[10px] md:text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                  Returnable if seal intact*
                </span>
              </div>
            </div>

            {/* Price block */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-bold text-emerald-600">
                  ₹{product.mrp.toFixed(2)}
                </span>
                <span className="text-xs line-through text-slate-400">
                  ₹{discountMrp}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  18% OFF
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                (Incl. of all taxes)
              </div>
            </div>

            {/* Delivery / offers strip */}
            <div className="bg-white rounded-2xl border border-slate-100 p-3 text-[11px] md:text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>📦</span>
                <span>
                  Delivery by{" "}
                  <span className="font-semibold">
                    Tomorrow / within 24–48 hours*
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏷️</span>
                <span>
                  Extra 5% cashback on UPI orders above{" "}
                  <span className="font-semibold">₹499</span>
                </span>
              </div>
            </div>

            {/* Pack info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-3 md:p-4 text-xs md:text-sm text-slate-700 space-y-1.5">
              <div className="flex flex-wrap gap-4">
                {product.product_form && (
                  <div>
                    <span className="font-semibold">Form: </span>
                    <span>{product.product_form}</span>
                  </div>
                )}
                {product.package && (
                  <div>
                    <span className="font-semibold">Pack: </span>
                    <span>{product.package}</span>
                  </div>
                )}
                {product.pack_qty && (
                  <div>
                    <span className="font-semibold">Units: </span>
                    <span>{product.pack_qty}</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Use this medicine as directed by your physician. Read all
                instructions on the label.
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={decreaseQty}
                  className="w-8 h-8 flex items-center justify-center text-lg text-slate-700 hover:bg-slate-100"
                >
                  −
                </button>
                <div className="w-10 text-center text-sm font-semibold">
                  {cartQty}
                </div>
                <button
                  type="button"
                  onClick={increaseQty}
                  className="w-8 h-8 flex items-center justify-center text-lg text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md text-sm md:text-base font-semibold"
              >
                Add to Cart
              </button>
            </div>

            {added && (
              <div className="text-xs text-emerald-700 flex items-center gap-1">
                ✅ Item(s) added to cart
              </div>
            )}
          </div>
        </div>

        {/* Tabs: overview / usage / safety */}
        <div className="mt-8 md:mt-10">
          <div className="border-b border-slate-200 flex gap-6 text-sm">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>
            <TabButton
              active={activeTab === "usage"}
              onClick={() => setActiveTab("usage")}
            >
              How to use
            </TabButton>
            <TabButton
              active={activeTab === "safety"}
              onClick={() => setActiveTab("safety")}
            >
              Safety information
            </TabButton>
          </div>

          <div className="py-4 md:py-5 text-xs md:text-sm text-slate-700 space-y-3">
            {activeTab === "overview" && (
              <>
                <p>
                  <span className="font-semibold">
                    {product.product_name}
                  </span>{" "}
                  is commonly prescribed for the management of various health
                  conditions as advised by your doctor. It should be used only
                  under medical supervision.
                </p>
                <p className="font-semibold">Key benefits:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Helps in managing the condition as prescribed.</li>
                  <li>Convenient {product.product_form?.toLowerCase()} form.</li>
                  <li>
                    From trusted manufacturer – {product.marketer}.
                  </li>
                </ul>
                <p className="text-[11px] text-slate-500">
                  Note: This is general information and may not describe your
                  specific prescription. Always follow your doctor&apos;s
                  advice and the instructions provided with the medicine.
                </p>
              </>
            )}

            {activeTab === "usage" && (
              <>
                <p className="font-semibold">Directions for use:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Take the dose exactly as recommended by your doctor or as
                    mentioned on the prescription.
                  </li>
                  <li>
                    Do not crush or break the{" "}
                    {product.product_form?.toLowerCase() || "tablet"} unless
                    advised.
                  </li>
                  <li>
                    If you miss a dose, take it as soon as you remember. Skip
                    if it&apos;s almost time for the next dose.
                  </li>
                </ul>
                <p className="font-semibold mt-3">Storage:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Store in a cool, dry place away from direct sunlight.</li>
                  <li>Keep out of reach of children.</li>
                </ul>
              </>
            )}

            {activeTab === "safety" && (
              <>
                <p className="font-semibold">Safety advice:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Inform your doctor about all medicines you are currently
                    taking.
                  </li>
                  <li>
                    Tell your doctor if you are pregnant, planning pregnancy or
                    breastfeeding.
                  </li>
                  <li>
                    Do not self-medicate or stop the medicine abruptly without
                    doctor&apos;s advice.
                  </li>
                </ul>
                <p className="text-[11px] text-slate-500">
                  This information is not a substitute for professional medical
                  advice. Always consult your doctor or pharmacist for more
                  details.
                </p>
              </>
            )}
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-6 md:mt-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Reviews list */}
          <div>
            <h2 className="text-sm md:text-base font-semibold mb-3">
              Ratings &amp; Reviews
            </h2>

            {reviews.length === 0 && (
              <p className="text-xs text-slate-500">
                No reviews yet. Be the first one to review this product.
              </p>
            )}

            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-100 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        {r.rating.toFixed(1)} ★
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-snug">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add review form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-3 md:p-4 text-xs space-y-3">
            <h3 className="font-semibold text-sm mb-1">
              Write a review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-2">
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Your name
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Rating
                </label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} – {["Excellent", "Good", "Okay", "Poor", "Very bad"][5 - r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Your review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none resize-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Share your experience with this medicine"
                />
              </div>

              {reviewError && (
                <p className="text-[11px] text-red-500">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full mt-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </form>
          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER */}
        {fbtProducts.length > 1 && (
          <section className="mt-8 md:mt-10">
            <h2 className="text-sm md:text-base font-semibold mb-3">
              Frequently bought together
            </h2>
            <div className="grid md:grid-cols-[2fr_1fr] gap-4 items-start">
              <div className="space-y-2">
                {fbtProducts.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFbtIds.includes(p.id)}
                      onChange={() => toggleFbt(p.id)}
                      className="mt-0.5"
                    />
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.product_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          No image
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold line-clamp-2 mb-1">
                        {p.product_name}
                      </div>
                      <div className="text-emerald-700 font-bold">
                        ₹{p.mrp.toFixed(2)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-3 md:p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Selected items</span>
                  <span className="font-semibold">
                    {selectedFbtIds.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total price</span>
                  <span className="font-semibold text-emerald-700">
                    ₹{fbtTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  disabled={selectedFbtIds.length === 0}
                  onClick={handleAddFbtToCart}
                  className="w-full mt-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
                >
                  Add selected to Cart
                </button>
              </div>
            </div>
          </section>
        )}

        {/* RELATED LAB TESTS (from API) */}
        {labTests.length > 0 && (
          <section className="mt-8 md:mt-10">
            <h2 className="text-sm md:text-base font-semibold mb-3">
              Related lab tests
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {labTests.map((t) => {
                const discount = Math.round(
                  (1 - t.offer_price / (t.price || 1)) * 100
                );
                return (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-100 rounded-2xl p-3 md:p-4 text-xs flex flex-col gap-2"
                  >
                    <div className="font-semibold text-sm">{t.name}</div>
                    <p className="text-[11px] text-slate-600">
                      {t.short_description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-emerald-700">
                        ₹{t.offer_price.toFixed(2)}
                      </span>
                      <span className="text-[11px] line-through text-slate-400">
                        ₹{t.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        {discount}% OFF
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/lab-tests")}
                      className="mt-1 rounded-full border border-emerald-500 text-emerald-600 text-[11px] font-semibold py-1.5 px-3 self-start hover:bg-emerald-50"
                    >
                      Book now
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related + Cross-selling */}
        <div className="mt-8 md:mt-10 space-y-6">
          {relatedRecent.length > 0 && (
            <RelatedSection
              title="Recently viewed products"
              products={relatedRecent}
            />
          )}

          {crossSelling.length > 0 && (
            <RelatedSection
              title="You may also like"
              products={crossSelling}
            />
          )}
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between z-40">
        <div>
          <div className="text-[11px] text-slate-500">Total</div>
          <div className="text-sm font-semibold text-emerald-600">
            ₹{(product.mrp * cartQty).toFixed(2)}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-semibold"
        >
          Add {cartQty} to Cart
        </button>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */

type TabButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

function TabButton({ active, children, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-2 border-b-2 -mb-px ${
        active
          ? "border-emerald-500 text-emerald-600 font-semibold"
          : "border-transparent text-slate-500 hover:text-slate-700"
      } text-xs md:text-sm`}
    >
      {children}
    </button>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-100 px-3 py-2">
      <span>{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function RelatedSection({
  title,
  products,
}: {
  title: string;
  products: RelatedProduct[];
}) {
  return (
    <section>
      <h3 className="text-sm md:text-base font-semibold mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-2 hover:shadow-md transition-shadow"
          >
            <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.product_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400">No image</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold line-clamp-2 mb-1">
                {p.product_name}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                ₹{p.mrp.toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
