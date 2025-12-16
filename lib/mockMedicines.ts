export type Medicine = {
  id: number;
  product_id: string;
  product_name: string;
  marketer: string;
  mrp: number;
  product_form: string;
  package: string;
  qty: string;
  image_url?: string;
};

export const mockMedicines: Medicine[] = [
  {
    id: 1,
    product_id: "DRS153083",
    product_name: "Jupiros Gold 20 Capsule",
    marketer: "Alkem Laboratories Ltd",
    mrp: 271.8,
    product_form: "Capsule",
    package: "Strip",
    qty: "10",
    image_url: "https://medicinedata.in/med/DRS153083_1.jpg",
  },
  {
    id: 2,
    product_id: "DRS175961",
    product_name: "Lzoid Tablet",
    marketer: "ADZO Lifesciences Pvt Ltd",
    mrp: 355.0,
    product_form: "Tablet",
    package: "Strip",
    qty: "10",
    image_url: "https://medicinedata.in/med/DRS175961_1.jpg",
  },
];
