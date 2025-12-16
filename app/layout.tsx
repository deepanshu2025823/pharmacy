import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pharmacy – Online Pharmacy & Medicines",
  description: "Online medicine ordering app similar to PharmEasy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}