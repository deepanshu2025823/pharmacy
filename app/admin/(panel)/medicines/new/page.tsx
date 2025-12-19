"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type MedicineForm = {
  product_name: string;
  product_type: string;
  marketer: string;
  manufacturer: string;
  mrp: string | number;
  prescription_required: number;
  status: string;
  composition: string;
  how_to_use: string;
  image_url: string;
};

/* ================= PAGE ================= */

export default function AddMedicinePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<"basic" | "details" | "media">("basic");

  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState<MedicineForm>({
    product_name: "",
    product_type: "",
    marketer: "",
    manufacturer: "",
    mrp: "",
    prescription_required: 0,
    status: "active",
    composition: "",
    how_to_use: "",
    image_url: "",
  });

  /* ================= HANDLERS ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f: File) => URL.createObjectURL(f));
    setImages((p) => [...p, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image_url: images.join(" | "),
        }),
      });

      toast.success("Medicine added successfully");
      router.push("/admin/medicines");
    } catch {
      toast.error("Failed to add medicine");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Add Medicine</h1>

      {/* ===== TABS ===== */}
      <div className="flex gap-2 mb-6">
        <Tab active={activeTab === "basic"} onClick={() => setActiveTab("basic")}>
          Basic Info
        </Tab>
        <Tab
          active={activeTab === "details"}
          onClick={() => setActiveTab("details")}
        >
          Details
        </Tab>
        <Tab active={activeTab === "media"} onClick={() => setActiveTab("media")}>
          Media
        </Tab>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 shadow space-y-6"
      >
        {/* ===== BASIC INFO ===== */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name" name="product_name" value={form.product_name} onChange={handleChange} />
            <Input label="Product Type" name="product_type" value={form.product_type} onChange={handleChange} />
            <Input label="Marketer" name="marketer" value={form.marketer} onChange={handleChange} />
            <Input label="Manufacturer" name="manufacturer" value={form.manufacturer} onChange={handleChange} />
            <Input label="MRP" name="mrp" value={form.mrp} onChange={handleChange} />

            <Select
              label="Prescription Required"
              name="prescription_required"
              value={String(form.prescription_required)}
              onChange={handleChange}
              options={[
                { label: "No", value: "0" },
                { label: "Yes", value: "1" },
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
              ]}
            />
          </div>
        )}

        {/* ===== DETAILS ===== */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <Textarea label="Composition" name="composition" value={form.composition} onChange={handleChange} />
            <Textarea label="How to Use" name="how_to_use" value={form.how_to_use} onChange={handleChange} />
          </div>
        )}

        {/* ===== MEDIA ===== */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer text-green-600 font-medium"
              >
                Click to upload images
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG • Multiple allowed
              </p>
            </div>

            {/* Manual URLs */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Or paste image URLs
              </label>
              <textarea
                rows={2}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="https://img1.jpg | https://img2.jpg"
                value={form.image_url}
                name="image_url"
                onChange={handleChange}
              />
            </div>

            {/* Preview */}
            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative border rounded-lg p-2 bg-white shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-28 w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            disabled={saving}
            className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700"
          >
            {saving ? "Saving..." : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Tab({ active, children, ...props }: any) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded ${
        active ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input {...props} value={props.value ?? ""} className="w-full border rounded px-3 py-2 mt-1" />
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <textarea {...props} value={props.value ?? ""} className="w-full border rounded px-3 py-2 mt-1" />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select {...props} className="w-full border rounded px-3 py-2 mt-1">
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
