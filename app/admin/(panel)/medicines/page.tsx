"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, RotateCcw, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Medicine = {
  id: number;
  product_name: string;
  marketer: string | null;
  product_type: string | null;
  mrp: number;
  prescription_required: number;
  status: "active" | "inactive" | "trash";
  review_count: number;
};

/* ================= PAGE ================= */

export default function MedicinesPage() {
  const router = useRouter();

  const [data, setData] = useState<Medicine[]>([]);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [rx, setRx] = useState("all");
  const [status, setStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"active" | "trash">("active");

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ================= MOVE TO TRASH ================= */

  const handleMoveToTrash = async (id: number) => {
    if (!confirm("Are you sure you want to move this medicine to trash?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/medicines/${id}/trash`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        alert("Medicine moved to trash successfully");
        fetchMedicines();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to move medicine to trash");
      }
    } catch (err) {
      console.error("Move to trash error:", err);
      alert("An error occurred while moving medicine to trash");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESTORE FROM TRASH ================= */

  const handleRestore = async (id: number) => {
    if (!confirm("Are you sure you want to restore this medicine?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/medicines/${id}/restore`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        alert("Medicine restored successfully");
        fetchMedicines();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to restore medicine");
      }
    } catch (err) {
      console.error("Restore error:", err);
      alert("An error occurred while restoring medicine");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PERMANENT DELETE ================= */

  const handlePermanentDelete = async (id: number) => {
    if (!confirm("⚠️ WARNING: This will PERMANENTLY delete this medicine from the database. This action CANNOT be undone! Are you absolutely sure?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/medicines/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("Medicine permanently deleted");
        fetchMedicines();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to delete medicine");
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
      alert("An error occurred while deleting medicine");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ================= */

  const fetchMedicines = async () => {
    try {
      const statusFilter = viewMode === "trash" ? "trash" : status;
      
      const res = await fetch(
        `/api/admin/medicines?page=${page}&limit=${limit}&q=${encodeURIComponent(
          search
        )}&rx=${rx}&status=${statusFilter}`,
        {
          credentials: "include",
        }
      );

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch medicines");
      }

      const result = await res.json();
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      setData([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [page, search, rx, status, viewMode]);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {viewMode === "trash" ? "Trash" : "Medicines"}
          </h1>
          <p className="text-sm text-gray-500">
            {viewMode === "trash"
              ? "Restore or permanently delete medicines"
              : "Manage pharmacy medicines"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode(viewMode === "active" ? "trash" : "active");
              setPage(1);
            }}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === "trash"
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <Trash size={16} className="mr-2" />
            {viewMode === "trash" ? "Back to Medicines" : "Trash"}
          </button>

          {viewMode === "active" && (
            <Link
              href="/admin/medicines/new"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              + Add Medicine
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {viewMode === "active" && (
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
      )}

      {/* Trash Filters */}
      {viewMode === "trash" && (
        <div className="grid grid-cols-1 gap-3">
          <input
            value={search}
            placeholder="Search in trash..."
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      )}

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
              {viewMode === "active" && (
                <>
                  <th className="p-4 text-center w-[8%]">Reviews</th>
                  <th className="p-4 text-center w-[10%]">Status</th>
                </>
              )}
              <th className="p-4 text-right w-[14%]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={viewMode === "active" ? 8 : 6}
                  className="p-6 text-center text-gray-400"
                >
                  {loading
                    ? "Loading..."
                    : viewMode === "trash"
                    ? "Trash is empty"
                    : "No medicines found"}
                </td>
              </tr>
            )}

            {data.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium truncate" title={m.product_name}>
                  {m.product_name}
                </td>
                <td className="p-4 truncate" title={m.marketer || ""}>
                  {m.marketer || "-"}
                </td>
                <td className="p-4 truncate" title={m.product_type || ""}>
                  {m.product_type || "-"}
                </td>
                <td className="p-4 text-right font-medium">₹{m.mrp}</td>

                <td className="p-4 text-center">
                  {m.prescription_required ? (
                    <span className="font-semibold text-red-600">Rx</span>
                  ) : (
                    <span className="text-green-600">OTC</span>
                  )}
                </td>

                {viewMode === "active" && (
                  <>
                    <td className="p-4 text-center">{m.review_count || 0}</td>

                    <td className="p-4 text-center">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          m.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </>
                )}

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    {viewMode === "active" ? (
                      <>
                        <Link
                          href={`/product/${m.id}`}
                          target="_blank"
                          className="text-gray-500 hover:text-emerald-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          href={`/admin/medicines/${m.id}/edit`}
                          className="text-gray-500 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          onClick={() => handleMoveToTrash(m.id)}
                          className="text-gray-500 hover:text-orange-600 disabled:opacity-50"
                          disabled={loading}
                          title="Move to Trash"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(m.id)}
                          className="text-gray-500 hover:text-green-600 disabled:opacity-50"
                          disabled={loading}
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                        </button>

                        <button
                          onClick={() => handlePermanentDelete(m.id)}
                          className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                          disabled={loading}
                          title="Permanent Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= Mobile Cards ================= */}
      <div className="md:hidden space-y-3">
        {data.length === 0 && (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl border">
            {loading
              ? "Loading..."
              : viewMode === "trash"
              ? "Trash is empty"
              : "No medicines found"}
          </div>
        )}

        {data.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{m.product_name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {m.marketer || "Unknown Brand"}
                </p>
              </div>
              {viewMode === "active" && (
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    m.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {m.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>{" "}
                <span className="font-medium">{m.product_type || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">MRP:</span>{" "}
                <span className="font-medium">₹{m.mrp}</span>
              </div>
              <div>
                <span className="text-gray-500">Prescription:</span>{" "}
                {m.prescription_required ? (
                  <span className="font-semibold text-red-600">Rx</span>
                ) : (
                  <span className="text-green-600">OTC</span>
                )}
              </div>
              {viewMode === "active" && (
                <div>
                  <span className="text-gray-500">Reviews:</span>{" "}
                  <span className="font-medium">{m.review_count || 0}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              {viewMode === "active" ? (
                <>
                  <Link
                    href={`/product/${m.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={16} />
                    View
                  </Link>

                  <Link
                    href={`/admin/medicines/${m.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleMoveToTrash(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                    Trash
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleRestore(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-green-600 hover:bg-green-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <RotateCcw size={16} />
                    Restore
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Trash size={16} />
                    Delete Forever
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage(page - 1)}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages || loading}
          onClick={() => setPage(page + 1)}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}