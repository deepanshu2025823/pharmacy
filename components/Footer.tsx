// components/Footer.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

interface FooterProps {
  stats?: {
    totalMedicines: number;
    totalLabTests: number;
    totalOrders: number;
    totalCustomers: number;
    recentOrders: number;
  } | null;
}

export default function Footer({ stats }: FooterProps) {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your newsletter subscription logic here
    console.log("Subscribing:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <span className="font-bold text-xl text-white">Pharmacy</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Your trusted online pharmacy for genuine medicines, health
              products and lab tests. Making healthcare accessible and
              affordable for everyone.
            </p>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                  <div className="font-bold text-teal-400 text-lg">
                    {stats.totalCustomers.toLocaleString()}+
                  </div>
                  <div className="text-xs text-slate-500">Happy Customers</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                  <div className="font-bold text-teal-400 text-lg">
                    {stats.totalOrders.toLocaleString()}+
                  </div>
                  <div className="text-xs text-slate-500">Orders Delivered</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: "Order Medicines", href: "#popular-medicines" },
                { name: "Book Lab Tests", href: "#lab-tests" },
                { name: "Health Products", href: "#categories" },
                { name: "Upload Prescription", href: "#hero" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              Company
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: "About Us", href: "#about" },
                { name: "Careers", href: "#hero" },
                { name: "Blog", href: "#hero" },
                { name: "Press", href: "#hero" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              Support
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: "Help Center", href: "#popular-medicines" },
                { name: "Contact Us", href: "#categories" },
                { name: "Returns & Refunds", href: "#popular-medicines" },
                { name: "Shipping Info", href: "#hero" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section - Fixed Layout */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-bold text-white text-base mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-slate-400">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm shadow-lg whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400 text-center md:text-left">
              © {new Date().getFullYear()} Pharmacy. All rights reserved. |{" "}
              <span className="text-slate-500">
                Design & Developed By Deepanshu Joshi
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="#hero"
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#hero"
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#hero"
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Social Links - Real Icons */}
          <div className="flex items-center justify-center gap-3 mt-5 pt-5 border-t border-slate-800/50">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-[#1877F2] rounded-full flex items-center justify-center transition-all duration-300 group"
              aria-label="Facebook"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737] rounded-full flex items-center justify-center transition-all duration-300 group"
              aria-label="Instagram"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-[#1DA1F2] rounded-full flex items-center justify-center transition-all duration-300 group"
              aria-label="Twitter"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-[#0A66C2] rounded-full flex items-center justify-center transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-[#FF0000] rounded-full flex items-center justify-center transition-all duration-300 group"
              aria-label="YouTube"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}