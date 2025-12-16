import MedicineCard from "./MedicineCard";
import type { Medicine } from "@/lib/mockMedicines";

type Props = {
  medicines: Medicine[];
};

export default function MedicineGrid({ medicines }: Props) {
  if (!medicines.length) {
    return (
      <div className="max-w-6xl mx-auto px-3 mt-6">
        <div className="bg-white rounded-xl p-6 text-center text-slate-500">
          No medicines found. Try another search.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {medicines.map((m) => (
        <MedicineCard key={m.id} medicine={m} />
      ))}
    </div>
  );
}
