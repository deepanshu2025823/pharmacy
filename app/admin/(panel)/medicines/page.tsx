"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

type Medicine = {
  id: number;
  product_name: string;
  marketer: string | null;
  product_type: string | null;
  mrp: number;
  prescription_required: number;
  status: "active" | "inactive";
  review_count: number;
};

export default function MedicinesPage() {
  const [data, setData] = useState<Medicine[]>([]);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [rx, setRx] = useState("all");
  const [status, setStatus] = useState("all");

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
  const controller = new AbortController();

  fetch(
    `/api/admin/medicines?page=${page}&limit=${limit}&q=${encodeURIComponent(
      search
    )}&rx=${rx}&status=${status}`,
    {
      credentials: "include",
      signal: controller.signal,
    }
  )
    .then(async (res) => {
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch medicines");
      }

      return res.json();
    })
    .then((res) => {
      if (!res) return;
      setData(res.data || []);
      setTotal(res.total || 0);
    })
    .catch((err) => {
      if (err.name === "AbortError") return;
      console.error(err);
      setData([]);
      setTotal(0);
    });

  return () => controller.abort();
}, [page, search, rx, status]);

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Medicines</h1>
        <p className="text-sm text-gray-500">
          Manage pharmacy medicines
        </p>
      </div>

      <Link
        href="/admin/medicines/new"
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        + Add Medicine
      </Link>
    </div>

    {/* Filters */}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <input
        value={search}
        placeholder="Search medicine..."
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      />

      <select
        value={rx}
        onChange={(e) => {
          setPage(1);
          setRx(e.target.value);
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="all">All (Rx + OTC)</option>
        <option value="1">Rx</option>
        <option value="0">OTC</option>
      </select>

      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    {/* ================= Desktop Table ================= */}
    {/* ================= Desktop Table ================= */}
<div className="hidden md:block rounded-xl border bg-white overflow-hidden">
  <table className="w-full table-fixed text-sm">
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="p-4 text-left w-[28%]">Name</th>
        <th className="p-4 text-left w-[20%]">Brand</th>
        <th className="p-4 text-left w-[12%]">Type</th>
        <th className="p-4 text-right w-[10%]">MRP</th>
        <th className="p-4 text-center w-[8%]">Rx</th>
        <th className="p-4 text-center w-[8%]">Reviews</th>
        <th className="p-4 text-center w-[10%]">Status</th>
        <th className="p-4 text-right w-[12%]">Actions</th>
      </tr>
    </thead>

    <tbody>
      {data.length === 0 && (
        <tr>
          <td colSpan={7} className="p-6 text-center text-gray-400">
            No medicines found
          </td>
        </tr>
      )}

      {data.map((m) => (
        <tr key={m.id} className="border-t hover:bg-gray-50">
          <td className="p-4 font-medium truncate">
            {m.product_name}
          </td>

          <td className="p-4 truncate">
            {m.marketer || "-"}
          </td>

          <td className="p-4 truncate">
            {m.product_type || "-"}
          </td>

          <td className="p-4 text-right font-medium">
            ₹{m.mrp}
          </td>

          <td className="p-4 text-center">
            {m.prescription_required ? (
              <span className="font-semibold text-red-600">Rx</span>
            ) : (
              <span className="text-green-600">OTC</span>
            )}
          </td>

          <td className="p-4 text-center">
  {m.review_count > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
      {m.review_count} ★
    </span>
  ) : (
    <span className="text-xs text-gray-400">0</span>
  )}
</td>

          <td className="p-4 text-center">
            <span
              className={`inline-block rounded px-2 py-1 text-xs ${
                m.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {m.status}
            </span>
          </td>

          <td className="p-4 text-right">
            <div className="flex justify-end gap-3">
              <Link
                href={`/product/${m.id}`}
                target="_blank"
                className="text-gray-500 hover:text-emerald-600"
              >
                <Eye size={16} />
              </Link>
              <Link
                href={`/admin/medicines/${m.id}/edit`}
                className="text-gray-500 hover:text-blue-600"
              >
                <Pencil size={16} />
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    {/* ================= Mobile Cards ================= */}
    <div className="grid gap-4 md:hidden">
      {data.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex justify-between gap-2">
            <div>
              <h3 className="font-semibold">{m.product_name}</h3>
              <p className="text-xs text-gray-500">
                {m.marketer || "-"}
              </p>
            </div>

            <span
              className={`h-fit rounded px-2 py-1 text-xs ${
                m.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {m.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">MRP</span>
              <p className="font-medium">₹{m.mrp}</p>
            </div>

            <div>
              <span className="text-gray-500">Rx</span>
              <p
                className={`font-medium ${
                  m.prescription_required
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {m.prescription_required ? "Rx" : "OTC"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <Link
              href={`/product/${m.id}`}
              target="_blank"
              className="text-gray-500 hover:text-emerald-600"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/admin/medicines/${m.id}/edit`}
              className="text-gray-500 hover:text-blue-600"
            >
              <Pencil size={18} />
            </Link>
          </div>
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);
}
