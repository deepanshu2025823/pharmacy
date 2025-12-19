"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then(setCustomers)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <div className="bg-white rounded-lg shadow divide-y">
        {customers.map((c) => (
          <div key={c.id} className="p-4">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-gray-500">{c.phone}</p>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <p className="text-gray-400 mt-4">No customers found</p>
      )}
    </div>
  );
}
