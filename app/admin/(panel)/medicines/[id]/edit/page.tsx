"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

/* ================= TYPES ================= */

type MedicineForm = {
  product_name: string;
  product_type: string;
  marketer: string;
  manufacturer: string;
  mrp: string | number;
  pack_size: string;
  units: string;
  prescription_required: number;
  status: string;
  composition: string;
  how_to_use: string;
  side_effects: string;
  safety_advice: string;
  key_benefits: string;
  storage_instructions: string;
  image_url: string;
};

type KeyBenefit = {
  id: string;
  text: string;
};

/* ================= PAGE ================= */

export default function EditMedicinePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [activeTab, setActiveTab] = useState<"basic" | "details" | "benefits" | "media">("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [keyBenefits, setKeyBenefits] = useState<KeyBenefit[]>([]);

  const [form, setForm] = useState<MedicineForm>({
    product_name: "",
    product_type: "",
    marketer: "",
    manufacturer: "",
    mrp: "",
    pack_size: "Strip",
    units: "10",
    prescription_required: 0,
    status: "inactive",
    composition: "",
    how_to_use: "",
    side_effects: "",
    safety_advice: "",
    key_benefits: "",
    storage_instructions: "",
    image_url: "",
  });

  /* ================= FETCH MEDICINE ================= */

  useEffect(() => {
    if (!id) return;

    const fetchMedicine = async () => {
      try {
        const res = await fetch(`/api/admin/medicines/${id}`, {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch medicine");
        }

        const data = await res.json();

        const urls =
          data.image_url
            ?.split("|")
            .map((u: string) => u.trim())
            .filter(Boolean) || [];

        setImages(urls);

        // Parse key benefits
        const benefits = data.key_benefits
          ? data.key_benefits.split("|").map((b: string, i: number) => ({
              id: `benefit-${i}`,
              text: b.trim(),
            }))
          : [];
        setKeyBenefits(benefits);

        setForm({
          product_name: data.product_name ?? "",
          product_type: data.product_type ?? "",
          marketer: data.marketer ?? "",
          manufacturer: data.manufacturer ?? "",
          mrp: data.mrp ?? "",
          pack_size: data.pack_size ?? "Strip",
          units: data.units ?? "10",
          prescription_required: data.prescription_required ?? 0,
          status: data.status ?? "inactive",
          composition: data.composition ?? "",
          how_to_use: data.how_to_use ?? "",
          side_effects: data.side_effects ?? "",
          safety_advice: data.safety_advice ?? "",
          key_benefits: data.key_benefits ?? "",
          storage_instructions: data.storage_instructions ?? "",
          image_url: data.image_url ?? "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load medicine");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Key Benefits Management
  const addBenefit = () => {
    setKeyBenefits((prev) => [
      ...prev,
      { id: `benefit-${Date.now()}`, text: "" },
    ]);
  };

  const updateBenefit = (id: string, text: string) => {
    setKeyBenefits((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  };

  const removeBenefit = (id: string) => {
    setKeyBenefits((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.product_name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!form.mrp || Number(form.mrp) <= 0) {
      alert("Valid MRP is required");
      return;
    }

    setSaving(true);

    const benefitsString = keyBenefits
      .filter((b) => b.text.trim())
      .map((b) => b.text.trim())
      .join(" | ");

    const payload = {
      ...form,
      image_url: images.join(" | "),
      key_benefits: benefitsString,
    };

    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed");
      }

      alert("Medicine updated successfully");
      router.push("/admin/medicines");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update medicine");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/medicines"
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Medicine</h1>
              <p className="text-sm text-gray-500 mt-1">Update medicine information and details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/medicines"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex gap-1">
          <TabButton active={activeTab === "basic"} onClick={() => setActiveTab("basic")}>
            Basic Info
          </TabButton>
          <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
            Details & Usage
          </TabButton>
          <TabButton active={activeTab === "benefits"} onClick={() => setActiveTab("benefits")}>
            Key Benefits
          </TabButton>
          <TabButton active={activeTab === "media"} onClick={() => setActiveTab("media")}>
            Media
          </TabButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Product Name"
                      name="product_name"
                      value={form.product_name}
                      onChange={handleChange}
                      placeholder="e.g., Lzoid Tablet"
                      required
                    />
                  </div>

                  <Input
                    label="Product Type / Form"
                    name="product_type"
                    value={form.product_type}
                    onChange={handleChange}
                    placeholder="e.g., Tablet, Syrup, Capsule"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Pack Size"
                      name="pack_size"
                      value={form.pack_size}
                      onChange={handleChange}
                      placeholder="e.g., Strip, Bottle"
                    />
                    <Input
                      label="Units"
                      name="units"
                      type="number"
                      value={form.units}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                    />
                  </div>

                  <Input
                    label="MRP (₹)"
                    name="mrp"
                    type="number"
                    step="0.01"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />

                  <Input
                    label="Marketer / Brand"
                    name="marketer"
                    value={form.marketer}
                    onChange={handleChange}
                    placeholder="e.g., ADZO Lifesciences Pvt Ltd"
                  />

                  <Input
                    label="Manufacturer"
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleChange}
                    placeholder="Manufacturer company name"
                  />

                  <Select
                    label="Prescription Required"
                    name="prescription_required"
                    value={String(form.prescription_required)}
                    onChange={handleChange}
                    options={[
                      { label: "No - OTC (Over the Counter)", value: "0" },
                      { label: "Yes - Rx (Prescription Required)", value: "1" },
                    ]}
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "Trash", value: "trash" },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Details & Usage Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Composition</h2>
                <Textarea
                  label="Composition / Active Ingredients"
                  name="composition"
                  value={form.composition}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Linezolid I.P. 600 mg"
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Information</h2>
                <div className="space-y-6">
                  <Textarea
                    label="How to Use"
                    name="how_to_use"
                    value={form.how_to_use}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Provide detailed usage instructions. Use this medicine as directed by your physician. Read all instructions on the label..."
                  />

                  <Textarea
                    label="Side Effects"
                    name="side_effects"
                    value={form.side_effects}
                    onChange={handleChange}
                    rows={4}
                    placeholder="List common and serious side effects..."
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety & Storage</h2>
                <div className="space-y-6">
                  <Textarea
                    label="Safety Advice"
                    name="safety_advice"
                    value={form.safety_advice}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide safety precautions, warnings, and contraindications..."
                  />

                  <Textarea
                    label="Storage Instructions"
                    name="storage_instructions"
                    value={form.storage_instructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Store in a cool and dry place away from sunlight"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Key Benefits Tab */}
          {activeTab === "benefits" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Key Benefits</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    List the main benefits of this medicine
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Benefit
                </button>
              </div>

              <div className="space-y-3">
                {keyBenefits.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500">
                      No benefits added yet. Click "Add Benefit" to start.
                    </p>
                  </div>
                )}

                {keyBenefits.map((benefit, index) => (
                  <div key={benefit.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={benefit.text}
                      onChange={(e) => updateBenefit(benefit.id, e.target.value)}
                      placeholder="Enter benefit description..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(benefit.id)}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload images
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 10MB • Multiple files allowed
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Manual URL Input */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or paste image URLs
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="https://example.com/image1.jpg | https://example.com/image2.jpg"
                    value={form.image_url}
                    name="image_url"
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Separate multiple URLs with " | " (pipe symbol)
                  </p>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Image Preview ({images.length})
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.map((url, i) => (
                        <div
                          key={i}
                          className="relative group border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Product ${i + 1}`}
                            className="h-32 w-full object-contain rounded"
                          />

                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-500">Image {i + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {images.length === 0 && (
                  <div className="mt-6 text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">No images added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function TabButton({ active, children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, required, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        value={props.value ?? ""}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
      />
    </div>
  );
}

function Textarea({ label, required, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        {...props}
        value={props.value ?? ""}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
      />
    </div>
  );
}

function Select({ label, options, required, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}