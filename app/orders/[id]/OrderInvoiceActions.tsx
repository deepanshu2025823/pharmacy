"use client";

export default function OrderInvoiceActions() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print(); // browser print dialog → user can save as PDF
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      🧾 Print / Download invoice
    </button>
  );
}
