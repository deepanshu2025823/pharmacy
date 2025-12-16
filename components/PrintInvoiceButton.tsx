// components/PrintInvoiceButton.tsx
"use client";

export default function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
    >
      Print / Download Invoice
    </button>
  );
}
