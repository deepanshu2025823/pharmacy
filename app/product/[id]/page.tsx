import Header from "@/components/Header";
import db from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

export type Product = {
  id: number;
  product_name: string;
  marketer: string;
  mrp: number;
  image_url?: string;
  product_form?: string;
  package?: string;
  pack_qty?: number;
};

export type RelatedProduct = {
  id: number;
  product_name: string;
  mrp: number;
  image_url?: string;
};

export type ProductReview = {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

// ⚠ Next.js 16 / React 19 – params is a Promise
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-red-500">
          Invalid product id.
        </div>
      </div>
    );
  }

  // ---------- MAIN PRODUCT ----------
  const [rows] = await db.query(
    "SELECT id, product_id, product_name, marketer, product_form, `package`, qty, mrp, image_url FROM medicines WHERE id = ? LIMIT 1",
    [productId]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-red-500">
          Product not found.
        </div>
      </div>
    );
  }

  const row: any = rows[0];

  let imageUrl: string | undefined = row.image_url || undefined;
  if (imageUrl && imageUrl.includes("|")) {
    imageUrl = imageUrl.split("|")[0].trim();
  }

  const product: Product = {
    id: row.id,
    product_name: row.product_name,
    marketer: row.marketer,
    mrp: Number(row.mrp ?? 0),
    image_url: imageUrl,
    product_form: row.product_form || "",
    package: row.package || "",
    pack_qty: row.qty ?? undefined,
  };

  // ---------- RELATED RECENT PRODUCTS ----------
  const [recentRows] = await db.query(
    "SELECT id, product_name, mrp, image_url FROM medicines WHERE id <> ? ORDER BY id DESC LIMIT 6",
    [productId]
  );

  const relatedRecent: RelatedProduct[] = (recentRows as any[]).map((r) => {
    let img: string | undefined = r.image_url || undefined;
    if (img && img.includes("|")) img = img.split("|")[0].trim();
    return {
      id: r.id,
      product_name: r.product_name,
      mrp: Number(r.mrp ?? 0),
      image_url: img,
    };
  });

  // ---------- CROSS-SELLING PRODUCTS (same marketer) ----------
  const [crossRows] = await db.query(
    "SELECT id, product_name, mrp, image_url FROM medicines WHERE marketer = ? AND id <> ? ORDER BY id ASC LIMIT 6",
    [product.marketer, productId]
  );

  const crossSelling: RelatedProduct[] = (crossRows as any[]).map((r) => {
    let img: string | undefined = r.image_url || undefined;
    if (img && img.includes("|")) img = img.split("|")[0].trim();
    return {
      id: r.id,
      product_name: r.product_name,
      mrp: Number(r.mrp ?? 0),
      image_url: img,
    };
  });

  // ---------- REVIEWS ----------
  let initialReviews: ProductReview[] = [];
  try {
    const [reviewRows] = await db.query(
      "SELECT id, product_id, name, rating, comment, created_at FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 20",
      [productId]
    );

    initialReviews = (reviewRows as any[]).map((r) => ({
      id: r.id,
      product_id: r.product_id,
      name: r.name,
      rating: Number(r.rating ?? 0),
      comment: r.comment || "",
      created_at: r.created_at
        ? new Date(r.created_at).toISOString()
        : new Date().toISOString(),
    }));
  } catch {
    // table na bhi ho to page crash na ho
    initialReviews = [];
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ProductDetailClient
        product={product}
        relatedRecent={relatedRecent}
        crossSelling={crossSelling}
        initialReviews={initialReviews}
      />
    </div>
  );
}
