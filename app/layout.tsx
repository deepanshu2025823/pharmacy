// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

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

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px" },
          }}
        />
        
        <Analytics />
      </body>
    </html>
  );
}