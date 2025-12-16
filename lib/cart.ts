// lib/cart.ts

export type CartItem = {
  id: number;
  product_name: string;
  mrp: number;
  image_url?: string;
  qty: number;
};

export const CART_STORAGE_KEY = "pharmacy_cart_v1";
export const CART_OPEN_EVENT = "pharmacy_cart_open";
export const CART_UPDATED_EVENT = "pharmacy_cart_updated";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY) || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// 👇 agar kahin aur pehle se getCartItems import kar rahe ho
// to ab ye error nahi aayega
export function getCartItems(): CartItem[] {
  return readCart();
}

export function writeCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function getCartCount(): number {
  const cart = readCart();
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

export function addToCart(
  item: { id: number; product_name: string; mrp: number; image_url?: string },
  qty: number = 1
) {
  if (typeof window === "undefined") return;

  let cart = readCart();
  const existing = cart.find((c) => c.id === item.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: item.id,
      product_name: item.product_name,
      mrp: item.mrp,
      image_url: item.image_url,
      qty,
    });
  }

  cart = cart.filter((c) => c.qty > 0);
  writeCart(cart);

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  window.dispatchEvent(new Event(CART_OPEN_EVENT));
}

export function updateCartItemQty(id: number, qty: number) {
  if (typeof window === "undefined") return;
  let cart = readCart();

  cart = cart
    .map((item) =>
      item.id === id ? { ...item, qty: qty < 1 ? 1 : qty } : item
    )
    .filter((item) => item.qty > 0);

  writeCart(cart);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function removeFromCart(id: number) {
  if (typeof window === "undefined") return;
  const cart = readCart().filter((item) => item.id !== id);
  writeCart(cart);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function clearCart() {
  // full cart reset
  writeCart([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}
