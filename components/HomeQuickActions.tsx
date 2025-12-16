type QuickAction = {
  id: number;
  label: string;
  subtitle: string;
  icon: string;
  bg: string;
};

const items: QuickAction[] = [
  {
    id: 1,
    label: "Order Medicine",
    subtitle: "Flat 18% OFF",
    icon: "💊",
    bg: "from-[#e6f7f5] to-[#c5f2eb]",
  },
  {
    id: 2,
    label: "Healthcare Products",
    subtitle: "Upto 60% OFF",
    icon: "🛒",
    bg: "from-[#fff5e0] to-[#ffe0b2]",
  },
  {
    id: 3,
    label: "Lab Tests",
    subtitle: "Upto 70% OFF",
    icon: "🧪",
    bg: "from-[#e8f0ff] to-[#ceddff]",
  },
  {
    id: 4,
    label: "Offers",
    subtitle: "View all deals",
    icon: "🎁",
    bg: "from-[#ffe6f2] to-[#ffc9e3]",
  },
];

export default function HomeQuickActions() {
  return (
    <section className="max-w-6xl mx-auto px-3 -mt-8 relative z-10 mt-0">
      <div className="grid gap-3 md:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            className={`rounded-2xl bg-gradient-to-br ${item.bg} shadow-sm px-4 py-3 flex items-center gap-3 hover:shadow-md transition`}
          >
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl">
              {item.icon}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-800">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-600">
                {item.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
