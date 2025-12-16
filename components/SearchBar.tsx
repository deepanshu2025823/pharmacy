type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="max-w-6xl mx-auto px-0 md:px-0 mt-0">
      <div className="bg-white rounded-full shadow-sm flex items-center px-3 py-2 gap-2">
        <span className="text-slate-400 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Search medicines, health products, etc."
          className="flex-1 outline-none text-sm md:text-base placeholder:text-slate-400 bg-transparent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button className="px-4 py-1.5 text-sm rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600">
          Search
        </button>
      </div>
    </div>
  );
}
