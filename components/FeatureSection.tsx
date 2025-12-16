const features = [
  {
    title: "Trusted Pharmacies",
    subtitle: "100% genuine medicines",
    icon: "✅",
  },
  {
    title: "Superfast Delivery",
    subtitle: "Within 24–48 hours*",
    icon: "🚚",
  },
  {
    title: "Best Prices",
    subtitle: "Upto 50% off on health products",
    icon: "💰",
  },
  {
    title: "24x7 Support",
    subtitle: "Help whenever you need",
    icon: "📞",
  },
];

export default function FeatureSection() {
  return (
    <section className="max-w-6xl mx-auto px-3 mt-10 mb-8">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5">
        <h2 className="font-semibold text-lg mb-4">Why choose Pharmacy?</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-lg">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-slate-500">{f.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
