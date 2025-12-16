type Category = {
  id: number;
  label: string;
  description: string;
  icon: string;
};

const categories: Category[] = [
  {
    id: 1,
    label: "Covid Essentials",
    description: "Masks, sanitizers & more",
    icon: "🩺",
  },
  {
    id: 2,
    label: "Diabetes Care",
    description: "Glucose monitors & strips",
    icon: "🩸",
  },
  {
    id: 3,
    label: "Cardiac Care",
    description: "Heart & BP medicines",
    icon: "❤️",
  },
  {
    id: 4,
    label: "Stomach Care",
    description: "Acidity & digestion",
    icon: "🍽️",
  },
  {
    id: 5,
    label: "Baby Care",
    description: "Diapers & baby products",
    icon: "👶",
  },
  {
    id: 6,
    label: "Skin Care",
    description: "Dermatology & cosmetics",
    icon: "🧴",
  },
];

export default function CategorySection() {
  return (
    <section className="max-w-6xl mx-auto px-3 mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Shop by categories</h2>
        <button className="text-xs text-emerald-600 font-semibold">
          View All &gt;
        </button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 text-left hover:-translate-y-0.5 hover:shadow-md transition"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-2 text-lg">
              {cat.icon}
            </div>
            <div className="font-semibold text-xs md:text-sm mb-1">
              {cat.label}
            </div>
            <div className="text-[11px] text-slate-500">{cat.description}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
