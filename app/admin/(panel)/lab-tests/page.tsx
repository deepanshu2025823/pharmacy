"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Search, Filter, FileImage, XCircle } from "lucide-react";

type LabTest = {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  concern: string;
  price: number;
  offer_price: number;
  tests_count: number;
  fasting_required: number;
  popular: number;
  description: string;
  image_url: string;
  status: "active" | "inactive";
  created_at: string;
};

export default function LabTestsPage() {
  const [data, setData] = useState<LabTest[]>([]);
  const [filteredData, setFilteredData] = useState<LabTest[]>([]);
  const [editing, setEditing] = useState<LabTest | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    short_description: "",
    concern: "",
    price: "",
    offer_price: "",
    tests_count: "",
    fasting_required: "0",
    popular: "0",
    description: "",
    status: "active" as "active" | "inactive",
  });

const load = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/admin/lab-tests");

    if (!res.ok) {
      console.error("Lab tests API failed", res.status);
      setData([]);
      setFilteredData([]);
      return;
    }

    const tests = await res.json();
    setData(tests);
    setFilteredData(tests);
  } catch (error) {
    console.error("Failed to load lab tests", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter((test) =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.concern?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((test) => test.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, data]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      
      // Create preview for first image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFiles[0]);
    }
  };

  const removeImage = () => {
    setFiles([]);
    setImagePreview("");
  };

  const uploadImages = async () => {
  if (files.length === 0) {
    return editing?.image_url || "";
  }

  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    console.error("Upload failed", res.status);
    return editing?.image_url || "";
  }

  const json = await res.json();

  if (!json?.urls || !Array.isArray(json.urls)) {
    console.error("Invalid upload response", json);
    return editing?.image_url || "";
  }

  return json.urls.join("|");
};

  const submit = async () => {
    if (!form.name || !form.price || !form.offer_price) {
      alert("Please fill all required fields (Name, Price, Offer Price)");
      return;
    }

    setLoading(true);
    try {
      const image_url = await uploadImages();

      const payload = {
        ...form,
        image_url,
        tests_count: form.tests_count || "0",
        fasting_required: form.fasting_required,
        popular: form.popular,
      };

      const url = editing
        ? `/api/admin/lab-tests/${editing.id}`
        : `/api/admin/lab-tests`;

      const res = await fetch(url, {
  method: editing ? "PUT" : "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  throw new Error("Save failed");
}

      resetForm();
      load();
    } catch (error) {
      console.error("Failed to save lab test", error);
      alert("Failed to save lab test");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFiles([]);
    setImagePreview("");
    setForm({
      name: "",
      short_description: "",
      concern: "",
      price: "",
      offer_price: "",
      tests_count: "",
      fasting_required: "0",
      popular: "0",
      description: "",
      status: "active",
    });
    setShowForm(false);
  };

  const edit = (t: LabTest) => {
    setEditing(t);
    setForm({
      name: t.name,
      short_description: t.short_description || "",
      concern: t.concern || "",
      price: String(t.price),
      offer_price: String(t.offer_price),
      tests_count: String(t.tests_count || 0),
      fasting_required: String(t.fasting_required || 0),
      popular: String(t.popular || 0),
      description: t.description || "",
      status: t.status,
    });
    
    // Set existing image as preview
    if (t.image_url) {
      setImagePreview(t.image_url);
    }
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lab test?")) return;
    
    setLoading(true);
    try {
      await fetch(`/api/admin/lab-tests/${id}`, { method: "DELETE" });
      load();
    } catch (error) {
      console.error("Failed to delete lab test", error);
      alert("Failed to delete lab test");
    } finally {
      setLoading(false);
    }
  };

  const getDiscountPercentage = (price: number, offerPrice: number) => {
    return Math.round(((price - offerPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lab Tests Management</h1>
            <p className="text-gray-600 mt-1">Manage your laboratory tests and pricing</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? "Cancel" : "Add New Test"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Edit Lab Test" : "Add New Lab Test"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name *
                </label>
                <input
                  placeholder="e.g., Complete Blood Count"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  placeholder="e.g., 75+ tests including CBC, LFT, KFT, Lipid profile"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concern/Category
                </label>
                <input
                  placeholder="e.g., Full Body, Heart, Diabetes, Thyroid"
                  value={form.concern}
                  onChange={(e) => setForm({ ...form, concern: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tests
                </label>
                <input
                  type="number"
                  placeholder="e.g., 75"
                  value={form.tests_count}
                  onChange={(e) => setForm({ ...form, tests_count: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="2499"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="899"
                  value={form.offer_price}
                  onChange={(e) => setForm({ ...form, offer_price: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Required
                </label>
                <select
                  value={form.fasting_required}
                  onChange={(e) => setForm({ ...form, fasting_required: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popular Test
                </label>
                <select
                  value={form.popular}
                  onChange={(e) => setForm({ ...form, popular: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Image
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleImageSelect}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {files.length > 0 && (
                  <p className="text-sm text-emerald-600 mt-1 font-medium">
                    ✓ {files[0].name} ({(files[0].size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supports: Images (JPG, PNG, GIF, WebP), PDF, Word, Excel files
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  placeholder="Detailed description about the test..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={submit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                {loading ? "Saving..." : editing ? "Update Test" : "Add Test"}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search lab tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Active Tests</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {data.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Popular Tests</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {data.filter((t) => t.popular === 1).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Inactive Tests</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {data.filter((t) => t.status === "inactive").length}
            </p>
          </div>
        </div>

        {/* Lab Tests Grid */}
        {loading && data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading lab tests...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600">No lab tests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50">
                  {test.image_url ? (
                    <img
                      src={test.image_url}
                      alt={test.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileImage size={48} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {test.popular === 1 && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        test.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </div>
                  {test.price && test.offer_price && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {getDiscountPercentage(test.price, test.offer_price)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
                      {test.name}
                    </h3>
                  </div>

                  {test.short_description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {test.short_description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {test.concern && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                        {test.concern}
                      </span>
                    )}
                    {test.tests_count > 0 && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {test.tests_count} Tests
                      </span>
                    )}
                    {test.fasting_required === 1 && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        Fasting Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{test.offer_price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{test.price}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => edit(test)}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => remove(test.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}